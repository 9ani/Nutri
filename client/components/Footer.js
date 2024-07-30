import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-green-800 text-white h-[100px] flex items-center">
      <div className="w-full px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <p className="text-xs">&copy; 2024 NUTRIWEEK. Все права защищены.</p>
        </div>
        <div className="flex justify-center space-x-2 md:space-x-4">
          <a href="#" className="text-white hover:text-green-300 transition-colors duration-300 text-xs">
            О нас
          </a>
          <a href="#" className="text-white hover:text-green-300 transition-colors duration-300 text-xs">
            Контакты
          </a>
          <a href="#" className="text-white hover:text-green-300 transition-colors duration-300 text-xs">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;