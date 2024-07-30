import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

const AddFoodModal = ({ show, handleClose, updateNutritionData, addFoodHistory, userID }) => {
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foodResult, setFoodResult] = useState(null);

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
        const data = await response.json();
        console.log("Added food", data);

        if (data && data.updatedWeekPlan) {
          updateNutritionData(data.updatedWeekPlan.weekPlan);
          addFoodHistory(data.allUserFoodHistory);
          setFoodResult({
            name: data.foodAnalysis.dish,
            imageUrl: data.allUserFoodHistory[data.allUserFoodHistory.length - 1].imageUrl,
            nutrients: data.nutritionData.totalNutrients,
          });
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

  const renderNutrients = (nutrients) => {
    const nutrientList = [
      { key: "ENERC_KCAL", label: "Calories" },
      { key: "PROCNT", label: "Protein" },
      { key: "FAT", label: "Fat" },
      { key: "CHOCDF", label: "Carbohydrates" },
      { key: "FIBTG", label: "Fiber" },
      { key: "SUGAR", label: "Sugar" },
    ];

    return (
      <ul className="list-group">
        {nutrientList.map((nutrient) => (
          nutrients[nutrient.key] && (
            <li key={nutrient.key} className="list-group-item d-flex justify-content-between align-items-center">
              {nutrient.label}
              <span>{`${Math.round(nutrients[nutrient.key].quantity)} ${nutrients[nutrient.key].unit}`}</span>
            </li>
          )
        ))}
      </ul>
    );
  };

  const handleModalClose = () => {
    handleClose();
    // Reset state so that the form reappears when the modal opens again
    setPhoto(null);
    setDescription("");
    setLoading(false);
    setError(null);
    setFoodResult(null);
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      size="lg"
    >
      <Modal.Header closeButton className="bg-green-500 text-white">
        <Modal.Title>{foodResult ? "Food Added" : "Add Food"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-6">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
            <p className="mt-2">Adding food...</p>
          </div>
        ) : foodResult ? (
          <div>
            <h3 className="text-xl font-bold mb-4">{foodResult.name}</h3>
            <div className="flex justify-center mb-4">
              <img src={foodResult.imageUrl} alt={foodResult.name} className="max-w-full h-auto rounded-lg" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Nutrients:</h4>
            {renderNutrients(foodResult.nutrients)}
            <Button 
              variant="secondary" 
              onClick={handleModalClose} 
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close
            </Button>
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