import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faInstagram } from "@fortawesome/free-brands-svg-icons";

const Footer = ({ hasWeekPlan }) => {
  return (
    <footer
      className={`${
        hasWeekPlan && hasWeekPlan.length > 0 ? "bg-[#CEE422]" : "bg-white"
      } mx-4 md:mx-12 rounded-full h-20 md:h-20 relative mt-8`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center h-full px-4 md:px-6 py-4">
        <div className="flex items-center justify-center">
          <span className="text-green-800 font-bold text-xl">
            © 2024 NUTRIWEEK
          </span>
        </div>

        <nav className="flex flex-row items-center gap-4">
          <a
            href="https://www.linkedin.com/in/gani-uapov-725a55282/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </a>
          <a
            href="https://www.instagram.com/nutriweek.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-800 no-underline hover:text-green-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faInstagram} size="2x" />
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
