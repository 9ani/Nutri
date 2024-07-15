import React, { useState } from "react";
import Modal from "react-modal";
import ProgressBar from "react-bootstrap/ProgressBar"; // Import ProgressBar from react-bootstrap

Modal.setAppElement("#__next");

const ModalComponent = ({
  isOpen,
  closeModal,
  onSubmit,
  userString,
  setWeekPlan,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("male");
  const [allergies, setAllergies] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [goals, setGoals] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userJson = {
      age: parseInt(age),
      weight: parseInt(weight),
      height: parseInt(height),
      gender,
      allergies: allergies.split(",").map((item) => item.trim()),
      dietaryPreferences: dietaryPreferences.split(",").map((item) => item.trim()),
      goals,
    };

    try {
      const response = await fetch("http://localhost:5000/api/v1/ration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userJson, userString }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit data: ${response.statusText}`);
      }

      const responseData = await response.json();
      const saveResponse = await fetch("http://localhost:5000/api/v1/saveWeekPlan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weekPlan: responseData }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save week plan: ${saveResponse.statusText}`);
      }

      const saveData = await saveResponse.json();
      localStorage.setItem("weekPlan", JSON.stringify(saveData));
      setWeekPlan(saveData);
      setLoading(false);
      closeModal();
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "480px",
          width: "100%",
          padding: "24px",
          border: "none",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
        },
      }}
      contentLabel="Enter User Data"
    >
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Введите ваши данные</h2>
        <ProgressBar   now={(currentStep / 7) * 100} label={`${currentStep}`} />

        {loading ? (
          <div className="text-center mt-4">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            {currentStep === 1 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="form-control"
                />
              </div>
            )}
            {currentStep === 2 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="form-control"
                />
              </div>
            )}
            {currentStep === 3 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="form-control"
                />
              </div>
            )}
            {currentStep === 4 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-control"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            )}
            {currentStep === 5 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="allergies">Allergies (comma-separated)</label>
                <input
                  type="text"
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="form-control"
                />
              </div>
            )}
            {currentStep === 6 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="dietaryPreferences">Dietary Preferences (comma-separated)</label>
                <input
                  type="text"
                  id="dietaryPreferences"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  className="form-control"
                />
              </div>
            )}
            {currentStep === 7 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="goals">Goals</label>
                <input
                  type="text"
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="form-control"
                />
              </div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevious}
                >
                  Previous
                </button>
              )}
              {currentStep <= 7 ? (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        )}

        {error && <div className="text-red-500 mt-4">{error}</div>}
      </div>
    </Modal>
  );
};

export default ModalComponent;
