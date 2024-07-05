import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner"; 
import "bootstrap/dist/css/bootstrap.min.css";

const AddFoodModal = ({ show, handleClose, updateNutritionData }) => {
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true); 

      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("description", description);

      const response = await fetch("http://localhost:5000/api/v1/add-food", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Food added successfully!");
        const data = await response.json();

        if (data && data.updatedWeekPlan && data.updatedWeekPlan) {
          localStorage.setItem("weekPlan", JSON.stringify(data.updatedWeekPlan.weekPlan));
          // updateNutritionData(data.fullUpdatedWeekPlan.weekPlan); 
        } else {
          console.error("Missing week plan data in response:", data);
        }

        handleClose();
      } else {
        console.error("Failed to add food.");
      }
    } catch (error) {
      console.error("Error adding food:", error);
      setError(error.message);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton style={ { display: "flex", justifyContent: "space-between", backgroundColor: "#29b260", color: "white" }}>
        <Modal.Title style={ {marginRight:"50px"} }>Add Food</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Analyzing food...</p>
          </div>
        ) : (
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
            <Button variant="primary" type="submit" style={{backgroundColor: "#29b260"}}>
              Submit
            </Button>
          </Form>
        )}

        {error && <p className="text-danger">{error}</p>}
      </Modal.Body>
    </Modal>
  );
};

export default AddFoodModal;
