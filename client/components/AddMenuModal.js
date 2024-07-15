import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

const AddMenuModal = ({ show1, handleClose1, nutritionNeeded }) => {
  const [menuImage, setMenuImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState(""); // State to store response message
  const [responseData, setResponseData] = useState([]); // State to store response data

  const handleMenuImageChange = (e) => {
    setMenuImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setResponseMessage(""); // Reset response message
      setResponseData([]); // Reset response data

      const formData = new FormData();
      formData.append("menuImage", menuImage);

      if (!nutritionNeeded || typeof nutritionNeeded !== 'object') {
        throw new Error("Invalid or missing nutritionScale");
      }

      formData.append("nutritionScale", JSON.stringify(nutritionNeeded));

      Object.keys(nutritionNeeded).forEach(key => {
        const value = nutritionNeeded[key];
        formData.append(key, value.toString());
      });

      const response = await fetch("http://localhost:5000/api/v1/add-menu", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data) {
          setResponseMessage("Menu added successfully!"); // Set success message
          setResponseData(data); // Set response data
          // handleClose1(); // Comment out this line if you want to show the response in the modal
        } else {
          throw new Error("Missing response data");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add menu");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show1} onHide={handleClose1} centered size="lg">
      <Modal.Header closeButton style={{ backgroundColor: "#29b260", color: "white" }}>
        <Modal.Title>Add Menu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Adding menu...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formMenuImage">
              <Form.Label>Upload Menu Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleMenuImageChange}
                required
              />
            </Form.Group>

            {error && <p className="text-danger mt-3">{error}</p>}
            {responseMessage && <p className="text-success mt-3">{responseMessage}</p>} {/* Display response message */}
            
            {responseData.length > 0 && (
              <div className="mt-3">
                <h5>Recommended Food:</h5>
                <ul>
                  {responseData.map((item, index) => (
                    <li key={index}>{item.food}: {item.quantity} grams</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              style={{ backgroundColor: "#28511D", borderColor: "#28511D" }}
            >
              Add Menu
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddMenuModal;
