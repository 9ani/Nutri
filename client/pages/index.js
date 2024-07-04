import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "react-bootstrap/ProgressBar";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ModalComponent from "../components/Modal";
import AddFoodModal from "../components/AddFoodModal";
import 'bootstrap/dist/css/bootstrap.min.css';

const IndexPage = () => {
  const [weekPlan, setWeekPlan] = useState([]);
  const [userString, setUserString] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedWeekPlan = localStorage.getItem("weekPlan");
    if (savedWeekPlan) {
      setWeekPlan(JSON.parse(savedWeekPlan));
    }
  }, []);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleButtonClick = () => setModalIsOpen(true);

  const handleCardClick = (dayPlan) => {
    router.push({
      pathname: `/day/${dayPlan.date}`,
      query: { dayPlan: JSON.stringify(dayPlan) },
    });
  };

  const calculatePercentage = (filled, max) => {
    return (filled / max) * 100;
  };

  return (
    <div className="container mx-auto mt-5">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Nutrition Tracker</h1>
      </header>

      {/* Landing Page or Week Plan Cards */}
      {weekPlan.length === 0 ? (
        <div className="text-center mt-12">
          <input
            type="text"
            value={userString}
            onChange={(e) => setUserString(e.target.value)}
            placeholder="Enter your prompt (save as userString)"
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
          />
          <br />
          <br />
          <button
            onClick={handleButtonClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none"
          >
            Open Modal
          </button>
          <ModalComponent
            isOpen={modalIsOpen}
            closeModal={() => setModalIsOpen(false)}
            userString={userString}
            setWeekPlan={setWeekPlan}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekPlan.map((dayPlan) => (
            <div
              key={dayPlan.date}
              className={`col-span-1 mb-4 ${
                dayPlan.date === today
                  ? "lg:col-span-2 lg:col-start-2"
                  : "lg:col-span-1"
              }`}
              onClick={() => handleCardClick(dayPlan)}
              style={{ cursor: "pointer" }}
            >
              <Card>
                <Card.Body>
                  <Card.Title>{dayPlan.date} - {dayPlan.day}</Card.Title>
                  <div className="mb-3">Progress</div>
                  <ProgressBar
                    now={calculatePercentage(
                      dayPlan.nutritionSummary?.calories_filled || 0,
                      dayPlan.nutritionSummary?.calories || 100
                    )}
                    label={`Calories ${dayPlan.nutritionSummary?.calories_filled || 0}/${dayPlan.nutritionSummary?.calories || 100}`}
                    max={100}
                  />
                  {/* Add other nutrient progress bars similarly if needed */}
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add Food Button (only show if weekPlan is not empty) */}
      {weekPlan.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="primary"
            onClick={handleShow}
            className="bg-blue-500 hover:bg-blue-600 focus:outline-none"
          >
            Add Food
          </Button>
          <AddFoodModal show={showModal} handleClose={handleClose} />
        </div>
      )}

      {/* Display User Data */}
      {userData && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Submitted User Data:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
