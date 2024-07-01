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

const ModalComponent = ({ isOpen, closeModal, onSubmit, userString }) => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('male'); 
  const [allergies, setAllergies] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [goals, setGoals] = useState('');
  const [weekPlan, setWeekPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userJson = {
      age: parseInt(age),
      weight: parseInt(weight),
      height: parseInt(height),
      gender,
      allergies: allergies.split(',').map(item => item.trim()),
      dietaryPreferences: dietaryPreferences.split(',').map(item => item.trim()),
      goals,
    };

    console.log('Request Data:', { userJson, userString });

    try {
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
      console.log('API Response:', responseData);

      setWeekPlan(responseData);

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

      closeModal();
    } catch (error) {
      console.error('Error submitting data:', error);
      setError(error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Enter User Data"
    >
      <h2>Enter User Data</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Age:
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <br />
        <label>
          Weight (kg):
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <br />
        <label>
          Height (cm):
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <br />
        <label>
          Gender:
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male" selected>Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <br />
        <label>
          Allergies (comma-separated):
          <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
        </label>
        <br />
        <label>
          Dietary Preferences (comma-separated):
          <input
            type="text"
            value={dietaryPreferences}
            onChange={(e) => setDietaryPreferences(e.target.value)}
          />
        </label>
        <br />
        <label>
          Goals:
          <input type="text" value={goals} onChange={(e) => setGoals(e.target.value)} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>

      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}

      {weekPlan && (
        <div style={{ marginTop: '20px' }}>
          <h3>Week Plan</h3>
          <pre>{JSON.stringify(weekPlan, null, 2)}</pre>
        </div>
      )}
    </Modal>
  );
};

export default ModalComponent;
