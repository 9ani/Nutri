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

      const response = await fetch(`${process.env.BACKEND_URL}/api/v1/add-menu`, {
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
      <Modal.Header closeButton className="bg-[#CEE422] text-[#28511D]">
        <Modal.Title>Add Menu</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-white p-6">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" className="text-[#28511D]">
              <span className="sr-only">Loading...</span>
            </Spinner>
            <p className="mt-2 text-[#28511D]">Adding menu...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <Form.Group controlId="formMenuImage">
              <Form.Label className="text-[#28511D] font-semibold">Upload Menu Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleMenuImageChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#28511D] focus:border-[#28511D]"
              />
            </Form.Group>

            {error && <p className="text-red-500 mt-3">{error}</p>}
            {responseMessage && <p className="text-green-500 mt-3">{responseMessage}</p>}
            
            {responseData.length > 0 && (
              <div className="mt-3">
                <h5 className="text-[#28511D] font-semibold">Recommended Food:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {responseData.map((item, index) => (
                    <li key={index} className="text-[#28511D]">{item.food}: {item.quantity} grams</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-full bg-[#28511D] hover:bg-[#1e3b16] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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