import React, { useState } from "react";
import ModalComponent from "../components/Modal";
import NutritionChart from "../components/NutritionChart";
const IndexPage = () => {
  const [userString, setUserString] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleButtonClick = () => {
    setModalIsOpen(true);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <input
        type="text"
        value={userString}
        onChange={(e) => setUserString(e.target.value)}
        placeholder="Enter your prompt (save as userString)"
      />
      <br />
      <br />
      <button onClick={handleButtonClick}>Open Modal</button>
      <ModalComponent
        isOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
        userString={userString}
      />
      <h1>Nutrition Data</h1>
      <NutritionChart userData={userData} />
      {userData && (
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <h3>Submitted User Data:</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
