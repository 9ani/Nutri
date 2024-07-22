import React from 'react';
import Link from 'next/link';

const FoodHistoryPreview = ({ foodHistory }) => {
  const recentFoods = foodHistory.slice(0, 2); // Get the last 2 eaten foods

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Последние приемы пищи</h3>
      {recentFoods.map((food, index) => (
        <div key={index} className="mb-4">
          <p><strong>{food.name}</strong> - {food.calories} калорий</p>
          <p>Съедено: {new Date(food.dateEaten).toLocaleString()}</p>
        </div>
      ))}
      <Link href="/history" className="text-green-800 font-bold">
      Посмотреть полную историю      </Link>
    </div>
  );
};

export default FoodHistoryPreview;