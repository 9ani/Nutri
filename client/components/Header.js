// components/Header.js
import React, { useState } from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    router.push("/sign-up");
  };

  const handleHistoryClick = () => {
    router.push("/history");
  };

  const handleEatInCafeClick = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(
              "http://localhost:5000/api/v1/recommend-food",
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
            setRecommendations(result.recommendations || []);
            setShowRecommendations(true);
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
    <header className={`header-container ${weekPlanLength === 0 ? "" : "user"}`}>
      <div className="header-content">
        <div className="header-title">
          <Image
            src={weekPlanLength === 0 ? "/images/logo1.png" : "/images/logo2.jpg"}
            alt="logo"
            width={70}
            height={64}
          />
          <a href="/" className="header-link">
            NUTRIWEEK
          </a>
        </div>
        <nav className="header-nav">
          <div className="header-nav1">
            <a href="#" className="header-nav-link">О нас</a>
            <a href="#" className="header-nav-link">Помощь</a>
            <a href="#" className="header-nav-link">Контакты</a>
          </div>
          <SignedOut>
            <div className="header-nav2">
              <button
                onClick={handleSignIn}
                className="btn-primary"
              >
                Вход
              </button>
              <button
                onClick={handleSignUp}
                className="btn-primary"
              >
                Регистрация
              </button>
            </div>
          </SignedOut>
          <SignedIn>
            {weekPlanLength > 0 && (
              <div className="header-nav2">
                <button
                  onClick={handleShow}
                  className="btn-primary"
                >
                  Добавить прием пищи
                </button>
                <button
                  onClick={handleShow1}
                  className="btn-primary"
                >
                  Добавить меню
                </button>
                <button
                  onClick={handleHistoryClick}
                  className="btn-primary"
                >
                  История
                </button>
                <button
                  onClick={handleEatInCafeClick}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Загрузка..." : "Поесть в кафе"}
                </button>
              </div>
            )}
            <UserButton />
          </SignedIn>
        </nav>
      </div>
      <Modal show={showRecommendations} onHide={() => setShowRecommendations(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Рекомендуемые блюда</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {recommendations.length > 0 ? (
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>
                  <strong>{rec.dish}</strong> в {rec.restaurant}
                  <p>{rec.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Нет доступных рекомендаций.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecommendations(false)}>
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
};

export default Header;
