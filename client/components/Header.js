import React from "react";
import Image from "next/image";
const Header = ({ weekPlanLength, handleShow , handleShow1 }) => {
  return (
    <header
      className={"header-container" + (weekPlanLength === 0 ? "" : " user")}
    >
      <div className="header-content">
        <div className="header-title">
          <Image
            src={
              weekPlanLength === 0 ? "/images/logo1.png" : "/images/logo2.jpg"
            }
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
            <a href="#" className="header-nav-link">
              О нас
            </a>
            <a href="#" className="header-nav-link">
              помощь
            </a>
            <a href="#" className="header-nav-link">
              Контакты
            </a>
          </div>
          {weekPlanLength === 0 && (
            <div className="header-nav2">
              <button>
                <a href="#" className="header-nav-link">
                  Вход
                </a>
              </button>
              <button>
                <a href="#" className="header-nav-link">
                  Регистрация
                </a>
              </button>
            </div>
          )}
          {weekPlanLength > 0 && (
            <div className="header-nav2">
              <button
                onClick={handleShow}
                className="bg-[#28511D] text-white py-2 px-4 rounded hover:bg-[#1e3b16] transition duration-300"
              >
                Добавить прием пищи
              </button>
              <button
                onClick={handleShow1}
                className="bg-[#28511D] text-white py-2 px-4 rounded hover:bg-[#1e3b16] transition duration-300"
              >
                Добавить меню
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
