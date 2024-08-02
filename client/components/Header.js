import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Hamburger from "hamburger-react";
import { load } from "@2gis/mapgl";

const Header = ({
  weekPlanLength,
  handleShow,
  handleShow1,
  foodHistory,
  todaysNutrition,
  setHasJustSignedOut,
  setHasJustCreatedPlan,
  setShowAuthModal,
}) => {
  const buttonStyle =
    "bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200 flex items-center justify-center";

  const router = useRouter();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useClerk();
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const mapRef = useRef(null);
  const handleHelpClick = (event) => {
    event.preventDefault(); // prevents the default action for the anchor tag
    setTimeout(() => {
      const helpSection = document.querySelector(".help");
      if (helpSection) {
        helpSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  };

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    router.push("/sign-up");
  };

  const handleHistoryClick = () => {
    router.push("/history");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem("tempWeekPlan");
      localStorage.clear();

      // console.log("Local storage cleared");
      setHasJustSignedOut(true);
      setHasJustCreatedPlan(false);
      setShowAuthModal(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handleEatInCafeClick = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/recommend-food`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  latitude: latitude,
                  longitude: longitude,
                  nutritionScale: todaysNutrition,
                }),
              }
            );

            const result = await response.json();
            // console.log("Recommended food and locations:", result);

            if (result.recommendations && result.recommendations.length > 0) {
              setRecommendations(result.recommendations);
              setShowRecommendations(true);
            } else {
              setRecommendations([]);
              setShowRecommendations(false);
            }
          } catch (error) {
            console.error("Error fetching recommendations:", error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      showRecommendations &&
      recommendations.length > 0 &&
      userLocation.latitude &&
      userLocation.longitude
    ) {
      // console.log("Triggering loadMap");
      loadMap();
    }
  }, [showRecommendations, recommendations, userLocation]);

  const loadMap = async () => {
    try {
      const mapglAPI = await load();
      const mapContainer = document.getElementById("map-container");

      if (mapContainer && userLocation.latitude && userLocation.longitude) {
        if (mapRef.current) {
          mapRef.current.destroy();
        }

        mapRef.current = new mapglAPI.Map(mapContainer, {
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 16,
          key: process.env.NEXT_PUBLIC_2GIS_API,
        });

        addMarkersToMap(mapglAPI); // moved out of map load
      } else {
        console.error("Invalid parameters for loading the map.");
      }
    } catch (error) {
      console.error("Error loading map:", error);
    }
  };

  const addMarkersToMap = (mapglAPI) => {
    if (!mapRef.current) {
      console.error("Map is not initialized");
      return;
    }

    const map = mapRef.current;

    // Add user location marker
    if (userLocation.latitude && userLocation.longitude) {
      new mapglAPI.Marker(map, {
        coordinates: [userLocation.longitude, userLocation.latitude],
        icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpbxapkXL_cf7iHZTE74OL8pXJ50gH48MYyA&s",
        size: [32, 32],
        anchor: [16, 32],
        label: {
          text: "Ваше местоположение",
          offset: [0, -60],
          relativeAnchor: [0.5, 0],
        },
      });
      console.log("User location marker added:", userLocation);
    } else {
      console.warn("User location is not available");
    }

    // Keep track of all valid coordinates
    const allCoordinates = [];
    if (userLocation.latitude && userLocation.longitude) {
      allCoordinates.push([userLocation.longitude, userLocation.latitude]);
    }

    // Create a Set to store unique coordinates
    const uniqueCoordinates = new Set();

    // Add markers for recommended cafes
    recommendations.forEach((rec) => {
      if (
        rec.coordinates &&
        rec.coordinates.latitude !== undefined &&
        rec.coordinates.longitude !== undefined
      ) {
        const coordKey = `${rec.coordinates.latitude},${rec.coordinates.longitude}`;

        if (!uniqueCoordinates.has(coordKey)) {
          uniqueCoordinates.add(coordKey);

          const markerCoordinates = [
            rec.coordinates.longitude,
            rec.coordinates.latitude,
          ];
          allCoordinates.push(markerCoordinates);

          new mapglAPI.Marker(map, {
            coordinates: markerCoordinates,
            icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxe5Wae6Chlxtos5O1VKcYgDXEc-ndHfJkLw&s",
            size: [32, 32],
            anchor: [32, 32],
            label: {
              text: rec.restaurant,
              color: "#28511D",
              haloRadius: 2,
              haloColor: "#CEE422",
              offset: [0, -60],
              relativeAnchor: [0.5, 0],
            },
          });

          // Add click event to the marker
          map.on("click", markerCoordinates, () => {
            const matchingRecs = recommendations.filter(
              (r) =>
                r.coordinates.latitude === rec.coordinates.latitude &&
                r.coordinates.longitude === rec.coordinates.longitude
            );
            const infoText = matchingRecs
              .map((r) => `${r.restaurant}: ${r.dish} - ${r.price}`)
              .join("\n");
            alert(infoText);
          });
        }
      } else {
        console.warn(`No valid coordinates for ${rec.restaurant}`);
      }
    });

    // Ensure that only valid coordinates are used for fitBounds
    const validCoordinates = allCoordinates.filter(
      (coord) =>
        Array.isArray(coord) &&
        coord.length === 2 &&
        coord.every((c) => typeof c === "number" && !isNaN(c))
    );

    // Fit bounds if we have valid coordinates
    if (validCoordinates.length > 1) {
      const bounds = validCoordinates.reduce(
        (acc, coord) => {
          return {
            minLon: Math.min(acc.minLon, coord[0]),
            minLat: Math.min(acc.minLat, coord[1]),
            maxLon: Math.max(acc.maxLon, coord[0]),
            maxLat: Math.max(acc.maxLat, coord[1]),
          };
        },
        {
          minLon: Infinity,
          minLat: Infinity,
          maxLon: -Infinity,
          maxLat: -Infinity,
        }
      );

      setTimeout(() => {
        if (map && typeof map.fitBounds === "function") {
          try {
            map.fitBounds(
              [
                [bounds.minLon, bounds.minLat],
                [bounds.maxLon, bounds.maxLat],
              ],
              { padding: 50 }
            );
          } catch (error) {
            console.error("Error calling fitBounds:", error);
          }
        } else {
          console.error("Map or fitBounds is not available");
        }
      }, 100);
    } else {
      console.error("Not enough valid coordinates to fit bounds.");
    }
  };

  return (
    <header
      className={`${
        weekPlanLength === 0 ? "bg-white" : "bg-[#CEE422]"
      } mx-4 md:mx-12 rounded-full h-auto md:h-20 relative`}
    >
      <div className="flex justify-between items-center h-full px-4 md:px-6 py-2 md:py-0">
        <div className="flex items-center gap-4">
          <Image
            src={
              weekPlanLength === 0 ? "/images/logo1.png" : "/images/logo2.jpg"
            }
            alt="logo"
            width={70}
            height={64}
          />
          <a
            href="/"
            className="text-2xl no-underline font-rubick2"
          >
            NutriWeek
          </a>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          <SignedIn>
            {weekPlanLength > 0 && (
              <>
                <button onClick={handleShow} className={buttonStyle}>
                  Добавить прием пищи
                </button>
                <button onClick={handleShow1} className={buttonStyle}>
                  Добавить меню
                </button>
                <button onClick={handleHistoryClick} className={buttonStyle}>
                  История
                </button>
                <button
                  onClick={handleEatInCafeClick}
                  className={`${buttonStyle} ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    "Поесть в кафе"
                  )}
                </button>
              </>
            )}
            <UserButton signOutCallback={handleSignOut} />
          </SignedIn>
          <SignedOut>
            <a
              href="#"
              className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
            >
              О нас
            </a>
            <a
              href="#"
              onClick={handleHelpClick}
              className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
            >
              Помощь
            </a>
            <a
              href="#"
              className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
            >
              Контакты
            </a>
            <button
              onClick={handleSignIn}
              className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
            >
              Вход
            </button>
            <button
              onClick={handleSignUp}
              className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
            >
              Регистрация
            </button>
          </SignedOut>
        </nav>

        {/* Mobile Burger Menu */}
        <div className="md:hidden flex items-center">
          <Hamburger
            toggled={isMenuOpen}
            toggle={setIsMenuOpen}
            color="#2F855A"
            size={24}
            rounded={true}
          />
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}
      >
        <div className="p-4">
          <SignedIn>
            <UserButton signOutCallback={handleSignOut} />
            {weekPlanLength > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <button
                  onClick={handleShow}
                  className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                >
                  Добавить прием пищи
                </button>
                <button
                  onClick={handleShow1}
                  className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                >
                  Добавить меню
                </button>
                <button
                  onClick={handleHistoryClick}
                  className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                >
                  История
                </button>
                <button
                  onClick={handleEatInCafeClick}
                  className={`bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  } flex items-center justify-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    "Поесть в кафе"
                  )}
                </button>
              </div>
            )}
          </SignedIn>
          <SignedOut>
            <div className="flex flex-col gap-4 mt-4">
              <a
                href="#"
                className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
              >
                О нас
              </a>
              <a
                href="#"
                onClick={handleHelpClick}
                className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
              >
                Помощь
              </a>
              <a
                href="#"
                className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
              >
                Контакты
              </a>
              <button
                onClick={handleSignIn}
                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
              >
                Вход
              </button>
              <button
                onClick={handleSignUp}
                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
              >
                Регистрация
              </button>
            </div>
          </SignedOut>
        </div>
      </div>

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      <Modal
        show={showRecommendations}
        onHide={() => setShowRecommendations(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Рекомендуемые блюда</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              {recommendations.length > 0 ? (
                <ul>
                  {recommendations.map((rec, index) => (
                    <li key={index} className="mb-4">
                      <strong>{rec.dish}</strong> - {rec.price} в{" "}
                      {rec.restaurant}
                      <p>{rec.reason}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Нет доступных рекомендаций.</p>
              )}
            </div>
            <div className="md:w-1/2 md:ml-4">
              <div
                id="map-container"
                style={{ width: "100%", height: "400px" }}
              ></div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRecommendations(false)}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
};

export default Header;
