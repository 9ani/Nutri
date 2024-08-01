import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from 'react-bootstrap/Button';
import "bootstrap/dist/css/bootstrap.min.css";

const FoodHistory = () => {
  const [foodHistory, setFoodHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = JSON.parse(localStorage.getItem('foodHistory')) || [];
      setFoodHistory(storedHistory);
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-gray-100 min-h-screen">
      <Button
        onClick={handleBack}
        variant="outline-secondary"
        className="mb-4"
      >
        Назад
      </Button>
      <h1 className="text-3xl font-bold text-center text-green-800 mb-8">Food History</h1>
      {foodHistory.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No food history available.</p>
      ) : (
        <ul className="space-y-6">
          {foodHistory.map(item => {
            const dateEaten = new Date(item.dateEaten);
            const formattedDate = dateEaten.toLocaleString();

            return (
              <li key={item._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-48 w-full object-cover md:w-48"
                    />
                  </div>
                  <div className="p-8">
                    <h2 className="text-2xl font-semibold text-green-800 mb-2">{item.name}</h2>
                    <p className="text-gray-600 mb-4">Date Eaten: {formattedDate}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-gray-700"><span className="font-semibold">Calories:</span> {item.calories.toFixed(1)}</p>
                      <p className="text-gray-700"><span className="font-semibold">Proteins:</span> {item.proteins.toFixed(1)}g</p>
                      <p className="text-gray-700"><span className="font-semibold">Fats:</span> {item.fats.toFixed(1)}g</p>
                      <p className="text-gray-700"><span className="font-semibold">Carbohydrates:</span> {item.carbohydrates.toFixed(1)}g</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FoodHistory;