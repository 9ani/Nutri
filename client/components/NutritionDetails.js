import React from 'react';

const NutritionDetails = ({ nutritionSummary }) => {
  const roundValue = (value) => Math.round(value);

  return (
    <div className="bg-gradient-to-br from-white to-green-50 p-4 rounded-2xl shadow-lg h-[500px] flex flex-col justify-between transform hover:scale-105 transition-all duration-300">
      <h4 className="text-[#28511D] text-xl font-bold mb-2 text-center">Подробная информация о питании</h4>
      <div className="flex flex-col gap-3 flex-grow">
        {[
          { label: 'Калории', filled: nutritionSummary.calories_filled, total: nutritionSummary.calories, unit: '' },
          { label: 'Белки', filled: nutritionSummary.protein_filled, total: nutritionSummary.protein, unit: 'g' },
          { label: 'Жиры', filled: nutritionSummary.fats_filled, total: nutritionSummary.fats, unit: 'g' },
          { label: 'Углеводы', filled: nutritionSummary.carbohydrates_filled, total: nutritionSummary.carbohydrates, unit: 'g' },
        ].map((item, index) => (
          <div key={index} className="bg-[#CEE422] p-2 rounded-xl shadow-md">
            <p className="text-[#28511D] font-semibold text-sm mb-1">{item.label}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold">{roundValue(item.filled)}{item.unit}</span>
              <span>из</span>
              <span className="font-bold">{roundValue(item.total)}{item.unit}</span>
            </div>
            <div className="mt-1 bg-white rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${Math.min((item.filled / item.total) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionDetails;