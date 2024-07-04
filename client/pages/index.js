import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

import ModalComponent from "../components/Modal";
import AddFoodModal from "../components/AddFoodModal";

const IndexPage = () => {
  const [weekPlan, setWeekPlan] = useState([]);
  useEffect(() => {
    const savedWeekPlan = localStorage.getItem('weekPlan');
    if (savedWeekPlan) {
      setWeekPlan(JSON.parse(savedWeekPlan));
    }
  }, []);

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

  const calculatePercentage = (filled, max) => {
    return (filled / max) * 100;
  };

  const updateNutritionData = (nutritionData) => {
    const updatedWeekPlan = weekPlan.map(dayPlan => {
      if (dayPlan.date === today) { // Update the current day's plan
        const receivedCalories = nutritionData.nutritionData.calories; // Extract calories from the updated nutritionData structure
        const maxCalories = dayPlan.nutritionSummary?.calories; // Get max calories from nutritionSummary
        const caloriesFilled = dayPlan.nutritionSummary?.calories_filled || 0; // Get filled calories from nutritionSummary
        
        // Update the specific day's plan with the new calorie information
        return {
          ...dayPlan,
          nutritionSummary: {
            ...dayPlan.nutritionSummary,
            calories: maxCalories, // Update max calories
            calories_filled: caloriesFilled + receivedCalories // Update filled calories
          }
        };
      }
      return dayPlan;
    });

    setWeekPlan(updatedWeekPlan); // Update the weekPlan state with the updated day's plan
    localStorage.setItem('weekPlan', JSON.stringify(updatedWeekPlan)); // Save the updated weekPlan to localStorage
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
          setWeekPlan={setWeekPlan}
        />
        <div className="container mt-5">
          <Button variant="primary" onClick={handleShow}>
            Add Food
          </Button>
          <AddFoodModal show={showModal} handleClose={handleClose} updateNutritionData={updateNutritionData} />
        </div>
        <h1>Nutrition Data</h1>
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
                  now={calculatePercentage(dayPlan.nutritionSummary?.calories_filled || 0, dayPlan.nutritionSummary?.calories || 100)}
                  label={`Calories ${dayPlan.nutritionSummary?.calories_filled || 0}/${dayPlan.nutritionSummary?.calories || 100}`} 
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
