import React, { useState, useRef } from "react";
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
  const fileInputRef = useRef(null);

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

      if (!nutritionNeeded || typeof nutritionNeeded !== "object") {
        throw new Error("Invalid or missing nutritionScale");
      }

      formData.append("nutritionScale", JSON.stringify(nutritionNeeded));

      Object.keys(nutritionNeeded).forEach((key) => {
        const value = nutritionNeeded[key];
        formData.append(key, value.toString());
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/add-menu`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        // console.log(data);
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

  const handleModalClose = () => {
    handleClose1();
    setMenuImage(null);
    setLoading(false);
    setError(null);
    setResponseMessage("");
    setResponseData([]);
  };

  const renderRecommendedFood = (data) => (
    <ul className="list-group">
      {data.map((item, index) => (
        <li
          key={index}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          {item.food}
          <span>{`${item.quantity} grams`}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Modal show={show1} onHide={handleModalClose} centered size="lg">
      <Modal.Header closeButton className="bg-custom-green text-white">
        <Modal.Title>Добавить меню</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-6">
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status" className="text-[#28511D]">
              <span className="sr-only">Loading...</span>
            </Spinner>
            <p className="mt-2 text-[#28511D]">Adding menu...</p>
          </div>
        ) : responseMessage ? (
          <div>
            <h3 className="text-xl font-bold mb-4">{responseMessage}</h3>
            <h4 className="text-lg font-semibold mb-2">Рекомендованные блюда:</h4>
            {renderRecommendedFood(responseData)}
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
                onChange={handleMenuImageChange}
                accept="image/*"
                className="hidden"
                id="menu-image-input"
              />
              <label
                htmlFor="menu-image-input"
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
                {menuImage && (
                  <p className="text-sm mt-2" style={{ color: "#28511D" }}>
                    {menuImage.name}
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

export default AddMenuModal;