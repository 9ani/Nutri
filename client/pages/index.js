import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

import ModalComponent from "../components/Modal";
import NutritionChart from "../components/NutritionChart";
import AddFoodModal from "../components/AddFoodModal";


const IndexPage = () => {
  const [weekPlan, setWeekPlan] = useState([
    {
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
        "nutrients": "Fiber, Protein, Carbohydrates, Iron, Magnesium, Potassium",
        "calories": 1200
      }
    },
    {
      "date": "2024-07-02",
      "day": "Tuesday",
      "meals": [
        {
          "meal": "Breakfast",
          "description": "Scrambled eggs with avocado toast. 2 eggs, 1/2 avocado, 1 slice toast. (approx. 300 calories)"
        },
        {
          "meal": "Lunch",
          "description": "Turkey sandwich. (approx. 350 calories)"
        },
        {
          "meal": "Dinner",
          "description": "Beef stir-fry with vegetables. 150g beef, 100g vegetables. (approx. 300 calories)"
        },
        {
          "meal": "Snack",
          "description": "Mixed fruit (apple, banana, orange). (approx. 150 calories)"
        }
      ],
      "nutritionSummary": {
        "vitamins": "Vitamin A, Vitamin C, Vitamin E, Vitamin B6, Folate",
        "nutrients": "Fiber, Protein, Carbohydrates, Iron, Magnesium, Potassium",
        "calories": 1100
      }
    },
    {
      "date": "2024-07-03",
      "day": "Wednesday",
      "meals": [
        {
          "meal": "Breakfast",
          "description": "Smoothie bowl. 100g mixed berries, 50g granola. (approx. 300 calories)"
        },
        {
          "meal": "Lunch",
          "description": "Veggie wrap. (approx. 350 calories)"
        },
        {
          "meal": "Dinner",
          "description": "Chicken pasta. 100g chicken, 100g pasta, 50g vegetables. (approx. 350 calories)"
        },
        {
          "meal": "Snack",
          "description": "Protein bar. (approx. 150 calories)"
        }
      ],
      "nutritionSummary": {
        "vitamins": "Vitamin A, Vitamin C, Vitamin D, Vitamin B6, Folate",
        "nutrients": "Fiber, Protein, Carbohydrates, Calcium, Iron, Magnesium, Potassium",
        "calories": 1150
      }
    },
    {
      "date": "2024-07-04",
      "day": "Thursday",
      "meals": [
        {
          "meal": "Breakfast",
          "description": "Greek yogurt with honey. 2 cups yogurt, 50g honey. (approx. 250 calories)"
        },
        {
          "meal": "Lunch",
          "description": "Quinoa salad. 100g quinoa, 100g mixed vegetables. (approx. 300 calories)"
        },
        {
          "meal": "Dinner",
          "description": "Baked cod with asparagus. 100g cod, 100g asparagus, 50g potatoes. (approx. 350 calories)"
        },
        {
          "meal": "Snack",
          "description": "Apple slices with peanut butter. (approx. 100 calories)"
        }
      ],
      "nutritionSummary": {
        "vitamins": "Vitamin A, Vitamin C, Vitamin K, Vitamin B6, Folate",
        "nutrients": "Fiber, Protein, Carbohydrates, Iron, Magnesium, Potassium",
        "calories": 1000
      }
    },
    {
      "date": "2024-07-05",
      "day": "Friday",
      "meals": [
        {
          "meal": "Breakfast",
          "description": "Avocado toast with eggs. 100g avocado, 50g toast. (approx. 300 calories)"
        },
        {
          "meal": "Lunch",
          "description": "Chicken Caesar salad. (approx. 250 calories)"
        },
        {
          "meal": "Dinner",
          "description": "Pork chops with mashed potatoes. 100g pork, 100g potatoes. (approx. 300 calories)"
        },
        {
          "meal": "Snack",
          "description": "Carrot sticks with hummus. (approx. 150 calories)"
        }
      ],
      "nutritionSummary": {
        "vitamins": "Vitamin A, Vitamin C, Vitamin E, Vitamin B6, Folate",
        "nutrients": "Fiber, Protein, Carbohydrates, Iron, Magnesium, Potassium",
        "calories": 1000
      }
    },
    {
      "date": "2024-07-06",
      "day": "Saturday",
      "meals": [
        {
          "meal": "Breakfast",
          "description": "Pancakes with maple syrup. 2 pancakes, 50g syrup. (approx. 300 calories)"
        },
        {
          "meal": "Lunch",
          "description": "Grilled cheese sandwich. 10g butter. (approx. 350 calories)"
        },
        {
          "meal": "Dinner",
          "description": "Tacos. 100g beef, 100g lettuce. (approx. 350 calories)"
        },
        {
          "meal": "Snack",
          "description": "Granola bar. (approx. 150 calories)"
        }
      ],
      "nutritionSummary": {
        "vitamins": "Vitamin A, Vitamin C, Vitamin K, Vitamin B6, Folate",
        "nutrients": "Fiber, Protein, Carbohydrates, Iron, Magnesium, Potassium",
        "calories": 1150
      }
    },
    {
      "date": "2024-07-07",
      "day": "Sunday",
      "meals": [
        {
          "meal": "Breakfast",
          "description": "Omelet. 2 eggs, 1 tomato. (approx. 300 calories)"
        },
        {
          "meal": "Lunch",
          "description": "Baked salmon with rice. (approx. 350 calories)"
        },
        {
          "meal": "Dinner",
          "description": "Chicken curry with rice. 100g chicken, 100g rice. (approx. 300 calories)"
        },
        {
          "meal": "Snack",
          "description": "Mixed nuts (almonds, walnuts, cashews). (approx. 150 calories)"
        }
      ],
      "nutritionSummary": {
        "vitamins": "Vitamin A, Vitamin C, Vitamin K, Vitamin B6, Folate",
        "nutrients": "Fiber, Protein, Carbohydrates, Iron, Magnesium, Potassium",
        "calories": 1100
      }
    }
  ]);

  const [userString, setUserString] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleButtonClick = () => {
    setModalIsOpen(true);
  };

  const handleCardClick = (dayPlan) => {
    router.push(`/day/${dayPlan.date}`);
  };

  const calculatePercentage = (current, max) => {
    return (current / max) * 100;
  };


  return (
    <div className="container mt-5">
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <input
          type="text"
          value={userString}
          onChange={(e) => setUserString(e.target.value)}
          placeholder="Enter your prompt (save as userString)"
        />
        <br />
        <br />
        <button onClick={handleButtonClick}>Open Modal</button>
        <ModalComponent
          isOpen={modalIsOpen}
          closeModal={() => setModalIsOpen(false)}
          userString={userString}
        />
        <div className="container mt-5">
          <Button variant="primary" onClick={handleShow}>
            Add Food
          </Button>
          <AddFoodModal show={showModal} handleClose={handleClose} />
        </div>
        <h1>Nutrition Data</h1>
        <NutritionChart userData={userData} />
        {userData && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <h3>Submitted User Data:</h3>
            <pre>{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}
      </div>
      <h1 className="text-center">Nutrition Data for the Week</h1>
      <div className="row">
        {weekPlan.map((dayPlan) => (
          <div
            key={dayPlan.date}
            className={`col-12 mb-4 ${dayPlan.date === today ? 'col-lg-8 offset-lg-2' : 'col-lg-4'}`}
            onClick={() => handleCardClick(dayPlan)}
            style={{ cursor: 'pointer' }}
          >
            <Card>
              <Card.Body>
                <Card.Title>{dayPlan.date} - {dayPlan.day}</Card.Title>
                Progress
                <ProgressBar 
                  now={calculatePercentage(200, dayPlan.nutritionSummary?.calories || 100)}
                  label={`Calories`} 
                  max={100}
                />
                {/* Add other nutrient progress bars similarly if needed */}
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndexPage;
