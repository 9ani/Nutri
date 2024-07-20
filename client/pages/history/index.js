import React, { useEffect, useState } from 'react';

const FoodHistory = () => {
    const [foodHistory, setFoodHistory] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedHistory = JSON.parse(localStorage.getItem('FoodHistory')) || [];
            setFoodHistory(storedHistory);
        }
    }, []);

    return (
        <div className="max-w-3xl mx-auto p-6 font-sans">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Food History</h1>
            {foodHistory.length === 0 ? (
                <p className="text-center text-gray-600">No food history available.</p>
            ) : (
                <ul className="space-y-4">
                    {foodHistory.map(item => {
                        const dateEaten = new Date(item.dateEaten);
                        const formattedDate = dateEaten.toLocaleString();

                        return (
                            <li key={item._id} className="flex items-center space-x-4 border border-gray-300 rounded-lg p-4">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                                    <p className="text-gray-600">Date Eaten: {formattedDate}</p>
                                    <p className="text-gray-600">Calories: {item.calories}</p>
                                    <p className="text-gray-600">Proteins: {item.proteins}g</p>
                                    <p className="text-gray-600">Fats: {item.fats}g</p>
                                    <p className="text-gray-600">Carbohydrates: {item.carbohydrates}g</p>
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
