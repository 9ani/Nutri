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
  ]);
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
          setWeekPlan={setWeekPlan}
        />
        <div className="container mt-5">
          <Button variant="primary" onClick={handleShow}>
            Add Food
          </Button>
          <AddFoodModal show={showModal} handleClose={handleClose} />
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
                  now={calculatePercentage(0, dayPlan.nutritionSummary?.calories || 100)}
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
