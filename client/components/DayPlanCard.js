import React from 'react';

const DayPlanCard = ({ dayPlan, handleCardClick }) => {
  if (!dayPlan) {
    return null; // You can return a fallback UI here if needed
  }

  const formatNutrition = (filled, total) => {
    return `${Math.round(filled)} / ${Math.round(total)}`;
  };

  const dayTranslations = {
    Monday: "Понедельник",
    Tuesday: "Вторник",
    Wednesday: "Среда",
    Thursday: "Четверг",
    Friday: "Пятница",
    Saturday: "Суббота",
    Sunday: "Воскресенье",
  };

  return (
    <div
      className="border-2 border-green-800 rounded-2xl overflow-hidden w-full mx-auto cursor-pointer transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-green-50 shadow-xl"
      onClick={() => handleCardClick(dayPlan)}
    >
      <div className="p-6 h-full flex flex-col min-h-[450px] md:h-[450px]">
        <h3 className="text-2xl font-bold mb-4 text-green-800">
          { dayPlan.date} - {dayTranslations[dayPlan.day] || dayPlan.day}
        </h3>
        <div className="flex-grow overflow-auto mb-6 pr-2 custom-scrollbar">
          <h4 className="font-bold mb-3 text-lg text-green-700">Основные блюда:</h4>
          <ul className="list-none">
            {dayPlan.meals.slice(0, 3).map((meal, index) => (
              <li key={index} className="mb-2 pl-4 border-l-4 border-green-500">
                <span className="font-semibold">{meal.meal}:</span> {meal.description.split(',')[0]}
              </li>
            ))}
          </ul>
          {dayPlan.meals.length > 3 && (
            <p className="text-sm text-gray-600 mt-3 italic">
              И еще {dayPlan.meals.length - 3} блюд...
            </p>
          )}
        </div>
        <div className="mt-auto bg-green-100 p-4 rounded-xl">
          <h4 className="font-bold mb-3 text-lg text-green-800">Питание</h4>
          <div className="grid grid-cols-2 gap-3">
            <p className="text-green-700">Калории: <span className="font-semibold">{formatNutrition(dayPlan.nutritionSummary.calories_filled, dayPlan.nutritionSummary.calories)}</span></p>
            <p className="text-green-700">Белки: <span className="font-semibold">{formatNutrition(dayPlan.nutritionSummary.protein_filled, dayPlan.nutritionSummary.protein)}g</span></p>
            <p className="text-green-700">Жиры: <span className="font-semibold">{formatNutrition(dayPlan.nutritionSummary.fats_filled, dayPlan.nutritionSummary.fats)}g</span></p>
            <p className="text-green-700">Углеводы: <span className="font-semibold">{formatNutrition(dayPlan.nutritionSummary.carbohydrates_filled, dayPlan.nutritionSummary.carbohydrates)}g</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayPlanCard;