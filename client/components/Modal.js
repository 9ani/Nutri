import React, { useState } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#__next');

const ModalComponent = ({ isOpen, closeModal, onSubmit, userString, setWeekPlan }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [goals, setGoals] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Track loading state

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // Set loading state to true

    const userJson = {
      age: parseInt(age),
      weight: parseInt(weight),
      height: parseInt(height),
      gender,
      allergies: allergies.split(',').map((item) => item.trim()),
      dietaryPreferences: dietaryPreferences.split(',').map((item) => item.trim()),
      goals,
    };

    try {
      // Show loading message for API request
      onSubmit === 'saveWeekPlan' ? alert('We are saving the data') : console.log("We're building your ration");

      const response = await fetch('http://localhost:5000/api/v1/ration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userJson, userString }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit data: ${response.statusText}`);
      }

      const responseData = await response.json();

      const saveResponse = await fetch('http://localhost:5000/api/v1/saveWeekPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weekPlan: responseData }),
      });

      if (!saveResponse.ok) {
        throw new Error(`Failed to save week plan: ${saveResponse.statusText}`);
      }

      const saveData = await saveResponse.json();

      // Save week plan data to localStorage
      localStorage.setItem('weekPlan', JSON.stringify(saveData));

      setWeekPlan(saveData);
      setLoading(false); // Reset loading state
      closeModal();
    } catch (error) {
      setLoading(false); // Reset loading state
      setError(error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} style={customStyles} contentLabel="Enter User Data">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Enter User Data</h2>
        {loading ? ( // Show loading spinner while waiting for API response
          <div className="text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="age">
                  Age
                </label>
                <input
                  className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2	"
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            )}
            {currentStep === 2 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="weight">
                  Weight (kg)
                </label>
                <input
                  className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            )}
            {currentStep === 3 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="height">
                  Height (cm)
                </label>
                <input
                  className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  type="number"
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            )}
            {currentStep === 4 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="gender">
                  Gender
                </label>
                <select
                  className="form-select mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            )}
            {currentStep === 5 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="allergies">
                  Allergies (comma-separated)
                </label>
                <input
                  className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  type="text"
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                />
              </div>
            )}
            {currentStep === 6 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="dietaryPreferences">
                  Dietary Preferences (comma-separated)
                </label>
                <input
                  className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  type="text"
                  id="dietaryPreferences"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                />
              </div>
            )}
            {currentStep === 7 && (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="goals">
                  Goals
                </label>
                <input
                  className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  type="text"
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-500 focus:ring-opacity-50 pl-2"
                  onClick={handlePrevious}
                >
                  Previous
                </button>
              )}
              {currentStep < 7 ? (
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 pl-2"
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-500 focus:ring-opacity-50 pl-2"
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
