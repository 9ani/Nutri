import React, { useState } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useClerk } from "@clerk/nextjs";
import Hamburger from "hamburger-react"; // Import the Hamburger component

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
              `${process.env.BACKEND_URL}/api/v1/recommend-food`,
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
        weekPlanLength === 0 ? "bg-white" :"bg-[#CEE422]"
      } mx-4 md:mx-12 rounded-full h-auto md:h-20`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center h-full px-4 md:px-6 py-2 md:py-0">
        <div className="flex items-center gap-4">
          <Image
            src={
              weekPlanLength === 0 ? "/images/logo1.png" : "/images/logo2.jpg"
            }
            alt="logo"
            width={70}
            height={64}
          />
          <a href="/" className="text-green-800 font-bold text-2xl no-underline">
            NUTRIWEEK
          </a>
        </div>
        <div className="md:hidden flex items-center">
          <Hamburger toggled={isMenuOpen} toggle={setIsMenuOpen} />
        </div>
        <nav className={`md:flex items-center gap-6 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          {weekPlanLength === 0 && (
            <div className="flex flex-col md:flex-row gap-6">
              <a href="#" className="text-green-800">
                О нас
              </a>
              <a href="#" className="text-green-800">
                Помощь
              </a>
              <a href="#" className="text-green-800">
                Контакты
              </a>
            </div>
          )}
          <SignedOut>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <button
                onClick={handleSignIn}
                className="bg-green-800 text-white px-4 py-2 rounded"
              >
                Вход
              </button>
              <button
                onClick={handleSignUp}
                className="bg-green-800 text-white px-4 py-2 rounded"
              >
                Регистрация
              </button>
            </div>
          </SignedOut>
          <SignedIn>
            {weekPlanLength > 0 && (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <button
                  onClick={handleShow}
                  className="bg-green-800 text-white px-4 py-2 rounded"
                >
                  Добавить прием пищи
                </button>
                <button
                  onClick={handleShow1}
                  className="bg-green-800 text-white px-4 py-2 rounded"
                >
                  Добавить меню
                </button>
                <button
                  onClick={handleHistoryClick}
                  className="bg-green-800 text-white px-4 py-2 rounded"
                >
                  История
                </button>
                <button
                  onClick={handleEatInCafeClick}
                  className="bg-green-800 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Загрузка..." : "Поесть в кафе"}
                </button>
              </div>
            )}
            <UserButton signOutCallback={handleSignOut} />
          </SignedIn>
        </nav>
      </div>
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
