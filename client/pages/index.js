import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "react-bootstrap/ProgressBar";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ModalComponent from "../components/Modal";
import AddFoodModal from "../components/AddFoodModal";
import Header from "../components/Header"; 
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
<style jsx>{`
  .card-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`}</style>

const IndexPage = () => {
  const [weekPlan, setWeekPlan] = useState([]);
  const [userString, setUserString] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const savedWeekPlan = localStorage.getItem("weekPlan");
    if (savedWeekPlan) {
      setWeekPlan(JSON.parse(savedWeekPlan));
    }
  }, []);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleButtonClick = () => setModalIsOpen(true);

  const handleCardClick = (dayPlan) => {
    router.push({
      pathname: `/day/${dayPlan.date}`,
      query: { dayPlan: JSON.stringify(dayPlan) },
    });
  };

  const calculatePercentage = (filled, max) => {
    return (filled / max) * 100;
  };

  return (
    <div className="">
      <Header />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {weekPlan.length === 0 && (
          <>
            <div className="col-span-1 lg:col-span-1 flex-column justify-center mt-[300px] ml-[200px]">
              <h2 className="text-4xl font-bold mb-4">Nutrition Ration Planner</h2>
              <div className="text-center flex  p-1 gap-[20px] h-[60px]">
                <input
                  type="text"
                  value={userString}
                  onChange={(e) => setUserString(e.target.value)}
                  placeholder="Give me a ration"
                  className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:border-blue-500  w-[300px]"
                />
                <br />
                <br />
                <button
                  onClick={handleButtonClick}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 focus:outline-none"
                >
                  Get ration
                </button>
              </div>
              <h4 className="mt-4 text-lg font-medium">
                Enter your dietary preferences to generate meal plan.
              </h4>{" "}
              <ModalComponent
                isOpen={modalIsOpen}
                closeModal={() => setModalIsOpen(false)}
                userString={userString}
                setWeekPlan={setWeekPlan}
              />
            </div>

            <div className=" lg:block lg:col-span-1 relative h-[500px] mt-[100px] mr-[100px] b">
              <Image
                src="/bg.avif"
                alt="landing"
                layout="fill"
                objectFit="cover"
                className="rounded-3xl"
              />
            </div>
          </>
        )}
        {weekPlan.length > 0 &&
  weekPlan.map((dayPlan) => (
    <div
      key={dayPlan.date}
      className="mx-auto w-full lg:w-1/2 mb-4 px-4 mt-3"
      onClick={() => handleCardClick(dayPlan)}
      style={{ cursor: "pointer" }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold mb-3 text-center">{dayPlan.date} - {dayPlan.day}</h3>
        <div className="mb-3 text-center">Progress</div>
        <ProgressBar
          now={calculatePercentage(
            dayPlan.nutritionSummary?.calories_filled || 0,
            dayPlan.nutritionSummary?.calories || 100
          )}
          label={`Calories ${
            dayPlan.nutritionSummary?.calories_filled || 0
          }/${dayPlan.nutritionSummary?.calories || 100}`}
          max={100}
          striped
          animated={dayPlan.date === today}
          variant={dayPlan.date === today ? "success" : "info"}
          className="mb-3"
        />
      </div>
    </div>
  ))}




      </div>

      {weekPlan.length > 0 && (
  <div className="relative mt-8 flex justify-center items-center">
    <Button
      variant="primary"
      onClick={handleShow}
      className="bg-green-500 hover:bg-green-600 focus:outline-none py-3 px-6 rounded-md text-white shadow-md absolute"
      style={{
        backgroundColor: '#29b260',
        bottom: '35rem', 
      }}
    >
      Add Food
    </Button>
    <AddFoodModal show={showModal} handleClose={handleClose} />
  </div>
)}





      {userData && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Submitted User Data:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default IndexPage;