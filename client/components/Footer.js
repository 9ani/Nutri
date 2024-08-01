import React from 'react';

const Footer = ({ hasWeekPlan }) => {
  return (
    <footer className={`${
      hasWeekPlan ? "bg-white" : "bg-[#CEE422]"
    } mx-4 md:mx-12 rounded-full h-20 md:h-20 relative mt-8`}>
      <div className="flex flex-col md:flex-row justify-between items-center h-full px-4 md:px-6 py-4">
        <div className="flex items-center justify-center">
          <span className="text-green-800 font-bold text-xl">
            © 2024 NUTRIWEEK
          </span>
        </div>

        <nav className="flex flex-col md:flex-row items-center gap-4">
          <a href="#" className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200">
            О нас
          </a>
          <a href="#" className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200">
            Контакты
          </a>
          <a href="#" className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200">
            Политика конфиденциальности
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
