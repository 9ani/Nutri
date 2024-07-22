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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/add-food`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Food added successfully!");
        const data = await response.json();
        console.log("Added food",data);

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
      <Modal.Header closeButton className="bg-green-500 text-white">
        <Modal.Title>Add Food</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-6">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
            <p className="mt-2">Adding food...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <Form.Group controlId="formPhoto">
              <Form.Label className="font-semibold">Photo</Form.Label>
              <Form.Control 
                type="file" 
                onChange={handlePhotoChange} 
                accept="image/*"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label className="font-semibold">Description</Form.Label>
              <Form.Control
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Enter food description"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              />
            </Form.Group>

            {error && <p className="text-red-500">{error}</p>}

            <Button 
              variant="primary" 
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddFoodModal;