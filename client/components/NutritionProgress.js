import React from "react";
import { Nested } from "@alptugidin/react-circular-progress-bar";

const NutritionProgress = ({ nutritionSummary, date }) => {
  const calculatePercentage = (filled, max) => {
    if (max === 0) return 0;
    return Math.min((filled / max) * 100, 100);
  };

  return (
    <div className="bg-gradient-to-br from-white to-green-50 p-8 rounded-2xl shadow-lg mb-8 transform hover:scale-105 transition-all duration-300">
      <h3 className="text-[#28511D] text-3xl font-bold mb-6 text-center font-sans">
        {date}
      </h3>

      <div className="w-full max-w-md mx-auto">
        <Nested
          circles={[
            {
              text: "Калории",
              value: calculatePercentage(
                nutritionSummary?.calories_filled || 0,
                nutritionSummary?.calories || 100
              ),
              color: "#28511D",
            },
            {
              text: "Белки",
              value: calculatePercentage(
                nutritionSummary?.protein_filled || 0,
                nutritionSummary?.protein || 100
              ),
              color: "#CEE422",
            },
            {
              text: "Жиры",
              value: calculatePercentage(
                nutritionSummary?.fats_filled || 0,
                nutritionSummary?.fats || 100
              ),
              color: "#28511D",
            },
            {
              text: "Углеводы",
              value: calculatePercentage(
                nutritionSummary?.carbohydrates_filled || 0,
                nutritionSummary?.carbohydrates || 100
              ),
              color: "#CEE422",
            },
          ]}
          sx={{
            bgColor: "rgba(230, 230, 230, 0.6)",
            fontWeight: "bold",
            fontFamily: "Trebuchet MS, sans-serif",
            strokeLinecap: "round",
            loadingTime: 1500,
            valueAnimation: true,
            intersectionEnabled: true,
            textColor: "#28511D",
          }}
        />
      </div>
    </div>
  );
};

export default NutritionProgress;
