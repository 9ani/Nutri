import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

const AddFoodModal = ({ show, handleClose, updateNutritionData,addFoodHistory, userID }) => {
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
      setError(null);

      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("description", description);
      formData.append("userID", userID); 

      const response = await fetch("http://localhost:5000/api/v1/add-food", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Food added successfully!");
        const data = await response.json();

        if (data && data.updatedWeekPlan) {
          updateNutritionData(data.updatedWeekPlan.weekPlan);
          console.log("ALL DATATATAT HISTROY",data.allUserFoodHistory);
          addFoodHistory(data.allUserFoodHistory);
          handleClose();
        } else {
          throw new Error("Missing week plan data in response");
        }
      } else {
        throw new Error("Failed to add food");
      }
    } catch (error) {
      console.error("Error adding food:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
    >
      <Modal.Header closeButton style={{ backgroundColor: "#29b260", color: "white" }}>
        <Modal.Title>Add Food</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Adding food...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formPhoto" className="mb-3">
              <Form.Label>Photo</Form.Label>
              <Form.Control type="file" onChange={handlePhotoChange} accept="image/*" />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter food description"
              />
            </Form.Group>

            {error && <p className="text-danger mb-3">{error}</p>}

            <Button variant="primary" type="submit" style={{ backgroundColor: "#29b260", border: "none" }}>
              Submit
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddFoodModal;