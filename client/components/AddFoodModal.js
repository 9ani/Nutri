import React, { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddFoodModal = ({ show, handleClose, updateNutritionData }) => {
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState("");

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('description', description);

      const response = await fetch('http://localhost:5000/api/v1/add-food', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Food added successfully!');
        const data = await response.json(); // Assuming your backend returns nutrition data
        console.log(data);
        localStorage.setItem('weekPlan', JSON.stringify(data.updatedWeekPlan));

        updateNutritionData(data); // Call the callback to update nutrition data in main page
        handleClose();
      } else {
        console.error('Failed to add food.');
      }
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Food</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Upload a photo of food</Form.Label>
            <Form.Control type="file" onChange={handlePhotoChange} />
          </Form.Group>
          <Form.Group controlId="formDescription" className="mb-3">
            <Form.Label>Or describe the food</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={description} 
              onChange={handleDescriptionChange} 
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddFoodModal;
