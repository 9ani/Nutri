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
            "calcium": 300, // Start at 0
            "vitaminA": 500, // Start at 0
            "vitaminC": 70, // Start at 0
            "vitaminK": 120, // Start at 0
            "vitaminB6": 2, // Start at 0
            "folate": 400 // Start at 0
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

  // Group nutrients for display
  const nutrientGroups = {
    "Vitamins": {
      "vitaminA": 900, // mcg
      "vitaminC": 90, // mg
      "vitaminK": 120, // mcg
      "vitaminB6": 1.3, // mg
      "folate": 400 // mcg
    },
    "Macronutrients": {
      "fiber": 30, // grams
      "protein": 50, // grams
      "carbohydrates": 275 // grams
    },
    "Minerals": {
      "iron": 18, // mg
      "magnesium": 400, // mg
      "potassium": 4700, // mg
      "calcium": 1000 // mg
    }
  };

  return (
    <div className="container mt-5">
      <Card>
        <Card.Body>
          <Card.Title>{dayPlan.date}</Card.Title>
          <div className="mb-3">
            <strong>Calories</strong>
            <ProgressBar 
              now={calculatePercentage(dayPlan.nutritionSummary.calories, 2000)} 
              label={`Calories ${calculatePercentage(dayPlan.nutritionSummary.calories, 2000)}%`} 
              variant="primary" 
            />
          </div>

          {/* Cards for nutrient groups */}
          {Object.entries(nutrientGroups).map(([groupName, nutrients], index) => (
            <Card key={index} className="mb-3">
              <Card.Body>
                <Card.Title>{groupName}</Card.Title>
                {Object.entries(nutrients).map(([nutrient, max]) => (
                  <div className="mb-3" key={nutrient}>
                    <strong>{nutrient}</strong>
                    <ProgressBar 
                      now={calculatePercentage(dayPlan.nutritionSummary.nutrients[nutrient], max)} 
                      label={`${nutrient} ${calculatePercentage(dayPlan.nutritionSummary.nutrients[nutrient], max)}%`} 
                    />
                  </div>
                ))}
              </Card.Body>
            </Card>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DayDetail;
