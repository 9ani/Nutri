import React, { useState } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useClerk } from "@clerk/nextjs";
import Hamburger from "hamburger-react";

const Header = ({
  weekPlanLength,
  handleShow,
  handleShow1,
  foodHistory,
  todaysNutrition,
}) => {
  const router = useRouter();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut } = useClerk();

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
      localStorage.clear();
      console.log("Local storage cleared");
      window.location.href = "/"; // Force a full page reload
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
            console.log("Recommended food and locations:", result);

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
            className="text-green-800 font-bold text-2xl no-underline"
          >
            NUTRIWEEK
          </a>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <SignedIn>
            {weekPlanLength > 0 && (
              <>
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
                  className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? "Загрузка..." : "Поесть в кафе"}
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
            rounded
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
                  className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? "Загрузка..." : "Поесть в кафе"}
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
      >
        <Modal.Header closeButton>
          <Modal.Title>Рекомендуемые блюда</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {recommendations.length > 0 ? (
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index} className="mb-4">
                  <strong>{rec.dish}</strong> - {rec.price} в {rec.restaurant}
                  <p>{rec.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет доступных рекомендаций.</p>
          )}
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
