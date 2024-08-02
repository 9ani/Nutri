import React, { useState, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

const AddFoodModal = ({
  show,
  handleClose,
  updateNutritionData,
  addFoodHistory,
  userID,
}) => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [foodResult, setFoodResult] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("photo", photo);
      formData.append("userID", userID);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/add-food`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log("Added food", data);

        if (data && data.updatedWeekPlan) {
          updateNutritionData(data.updatedWeekPlan.weekPlan);
          addFoodHistory(data.allUserFoodHistory);
          setFoodResult({
            name: data.foodAnalysis.dish_in_russian,
            imageUrl:
              data.allUserFoodHistory[data.allUserFoodHistory.length - 1]
                .imageUrl,
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
        {nutrientList.map(
          (nutrient) =>
            nutrients[nutrient.key] && (
              <li
                key={nutrient.key}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {nutrient.label}
                <span>{`${Math.round(nutrients[nutrient.key].quantity)} ${
                  nutrients[nutrient.key].unit
                }`}</span>
              </li>
            )
        )}
      </ul>
    );
  };

  const handleModalClose = () => {
    handleClose();
    setPhoto(null);
    setLoading(false);
    setError(null);
    setFoodResult(null);
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered size="lg">
      <Modal.Header closeButton className="bg-custom-green text-white">
        <Modal.Title>{foodResult ? "Пища добавлена" : "Добавить пищу"}</Modal.Title>
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
              <img
                src={foodResult.imageUrl}
                alt={foodResult.name}
                className="max-w-full h-auto rounded-lg"
              />
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
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
                id="food-photo-input"
              />
              <label
                htmlFor="food-photo-input"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer"
                style={{ borderColor: "#28511D", backgroundColor: "#f0f8f0" }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3"
                    fill="none"
                    stroke="#28511D"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm" style={{ color: "#28511D" }}>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs" style={{ color: "#28511D" }}>
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
                {photo && (
                  <p className="text-sm mt-2" style={{ color: "#28511D" }}>
                    {photo.name}
                  </p>
                )}
              </label>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button
              variant="primary"
              type="submit"
              className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: "#CEE422",
                color: "#28511D",
                border: "none",
              }}
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
