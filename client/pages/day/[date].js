// pages/day/[date].js
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';

const DayDetail = () => {
  const router = useRouter();
  const { date } = router.query;
  const [dayPlan, setDayPlan] = useState(null);

  useEffect(() => {
    if (date) {
      // Hide fetch in comment and use manual data instead
      /*
      const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/v1/nutritionData/${date}`);
          const result = await response.json();
          setDayPlan(result.dayPlan);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
      */

      // Manual data
      const manualData = {
        "date": "2024-07-01",
        "day": "Monday",
        "meals": [
          {
            "meal": "Breakfast",
            "description": "Oatmeal with berries. 100g oats, 50g berries (blueberries, raspberries), 20g honey. (approx. 350 calories)"
          },
          {
            "meal": "Lunch",
            "description": "Grilled chicken salad. 200g chicken breast, 100g mixed greens. (approx. 400 calories)"
          },
          {
            "meal": "Dinner",
            "description": "Salmon with quinoa. 200g salmon, 100g quinoa. (approx. 300 calories)"
          },
          {
            "meal": "Snack",
            "description": "Greek yogurt with nuts. (approx. 150 calories)"
          }
        ],
        "nutritionSummary": {
          "vitamins": "Vitamin A, Vitamin C, Vitamin K, Vitamin B6, Folate",
          "nutrients": {
            "fiber": 5, // Start at 0
            "protein": 20, // Start at 0
            "carbohydrates": 40, // Start at 0
            "iron": 5, // Start at 0
            "magnesium": 35, // Start at 0
            "potassium": 1000, // Start at 0
          },
          "calories": 500 // Start at 0
        }
      };

      setDayPlan(manualData);
    }
  }, [date]);

  if (!dayPlan) {
    return <div>Loading...</div>;
  }

  const calculatePercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const maxNutrients = {
    fiber: 30, // grams
    protein: 50, // grams
    carbohydrates: 275, // grams
    iron: 18, // mg
    magnesium: 400, // mg
    potassium: 4700 // mg
  };

  return (
    <div className="container mt-5">
      <Card>
        <Card.Body>
          <Card.Title>{dayPlan.date}</Card.Title>
          <div className="mb-2">
            <strong>Calories</strong>
            <ProgressBar 
              now={calculatePercentage(dayPlan.nutritionSummary.calories, 2000)} 
              label={`Calories ${calculatePercentage(dayPlan.nutritionSummary.calories, 2000)}%`} 
              variant="primary" 
            />
          </div>
          <div className="mb-2">
            <strong>Fiber</strong>
            <ProgressBar 
              variant="success" 
              now={calculatePercentage(dayPlan.nutritionSummary.nutrients.fiber, maxNutrients.fiber)} 
              label={`Fiber ${calculatePercentage(dayPlan.nutritionSummary.nutrients.fiber, maxNutrients.fiber)}%`} 
            />
          </div>
          <div className="mb-2">
            <strong>Protein</strong>
            <ProgressBar 
              variant="info" 
              now={calculatePercentage(dayPlan.nutritionSummary.nutrients.protein, maxNutrients.protein)} 
              label={`Protein ${calculatePercentage(dayPlan.nutritionSummary.nutrients.protein, maxNutrients.protein)}%`} 
            />
          </div>
          <div className="mb-2">
            <strong>Carbohydrates</strong>
            <ProgressBar 
              variant="warning" 
              now={calculatePercentage(dayPlan.nutritionSummary.nutrients.carbohydrates, maxNutrients.carbohydrates)} 
              label={`Carbohydrates ${calculatePercentage(dayPlan.nutritionSummary.nutrients.carbohydrates, maxNutrients.carbohydrates)}%`} 
            />
          </div>
          <div className="mb-2">
            <strong>Iron</strong>
            <ProgressBar 
              variant="danger" 
              now={calculatePercentage(dayPlan.nutritionSummary.nutrients.iron, maxNutrients.iron)} 
              label={`Iron ${calculatePercentage(dayPlan.nutritionSummary.nutrients.iron, maxNutrients.iron)}%`} 
            />
          </div>
          <div className="mb-2">
            <strong>Magnesium</strong>
            <ProgressBar 
              variant="info" 
              now={calculatePercentage(dayPlan.nutritionSummary.nutrients.magnesium, maxNutrients.magnesium)} 
              label={`Magnesium ${calculatePercentage(dayPlan.nutritionSummary.nutrients.magnesium, maxNutrients.magnesium)}%`} 
            />
          </div>
          <div className="mb-2">
            <strong>Potassium</strong>
            <ProgressBar 
              variant="warning" 
              now={calculatePercentage(dayPlan.nutritionSummary.nutrients.potassium, maxNutrients.potassium)} 
              label={`Potassium ${calculatePercentage(dayPlan.nutritionSummary.nutrients.potassium, maxNutrients.potassium)}%`} 
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DayDetail;
