import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "react-bootstrap/Button";
import AddFoodModal from "../components/AddFoodModal";
import AddMenuModal from "../components/AddMenuModal";
import ModalComponent from "../components/Modal";
import Header from "../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import Flicking, { ViewportSlot } from "@egjs/react-flicking";
import { Pagination } from "@egjs/flicking-plugins";
import "@egjs/flicking/dist/flicking.css";
import "@egjs/flicking-plugins/dist/pagination.css";
import { Flat, Heat, Nested } from "@alptugidin/react-circular-progress-bar";

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));
const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

const IndexPage = () => {
  const [weekPlan, setWeekPlan] = useState([]);
  const [userString, setUserString] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
const [todaysNutrition, setTodaysNutrition] = useState({});
  const [todaysFood, setTodaysFood] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const plugins = [new Pagination({ type: "scroll" })];

  const calculatePercentage = (filled, max) => {
    if (max === 0) return 0;
    return Math.min((filled / max) * 100, 100);
  };

  useEffect(() => {
    const savedWeekPlan = localStorage.getItem("weekPlan");
    if (savedWeekPlan) {
      setWeekPlan(JSON.parse(savedWeekPlan));
    }
  }, []);
  const calculateNutritionNeeded = (nutritionSummary) => {
    return {
      calories_needed:
        (nutritionSummary.calories || 0) -
        (nutritionSummary.calories_filled || 0),
      protein_needed:
        (nutritionSummary.protein || 0) -
        (nutritionSummary.protein_filled || 0),
      fats_needed:
        (nutritionSummary.fats || 0) - (nutritionSummary.fats_filled || 0),
      carbs_needed:
        (nutritionSummary.carbohydrates || 0) -
        (nutritionSummary.carbohydrates_filled || 0),
    };
  };
  
  useEffect(() => {
    if (weekPlan.length > 0) {
      getTodaysFoodAndNutrition(weekPlan, today).then(({ todaysFood, todaysNutrition }) => {
        setTodaysFood(todaysFood);
        setTodaysNutrition(todaysNutrition);
        console.log("todaysFood:", todaysFood);
        console.log("todaysNutrition:", todaysNutrition);
      });
    }
  }, [weekPlan, today]);


  const handleShow = () => {
    setShowModal(true);
  };
  const handleShow1 = () => {
    setShowModal1(true);
  };
  const handleClose = () => {
    setShowModal(false);
  };
  const handleClose1 = () => {
    setShowModal1(false);
  };

  const handleButtonClick = () => {
    setModalIsOpen(true);
  };

  const handleCardClick = (dayPlan) => {
    console.log(dayPlan.nutritionSummary?.calories_filled);
    console.log(dayPlan.nutritionSummary?.protein_filled);
    console.log(dayPlan.nutritionSummary?.fats_filled);
    router.push({
      pathname: `/day/${dayPlan.date}`,
      query: { dayPlan: JSON.stringify(dayPlan) },
    });
  };

  const updateNutritionData = (updatedWeekPlan) => {
    setWeekPlan(updatedWeekPlan);
    localStorage.setItem("weekPlan", JSON.stringify(updatedWeekPlan));
  };
  const getTodaysFoodAndNutrition = async (weekPlan, today) => {
    try {
      const todayPlan = weekPlan.find((dayPlan) => dayPlan.date === today);
      if (todayPlan) {
        const todaysFood = todayPlan.meals;
        const todaysNutrition = todayPlan.nutritionSummary;
        return { todaysFood, todaysNutrition };
      } else {
        return { todaysFood: null, todaysNutrition: null };
      }
    } catch (error) {
      console.error("Error getting today's food and nutrition:", error);
      return { todaysFood: null, todaysNutrition: null };
    }
  };
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    console.log("showModal state:", showModal);
  }, [showModal]);

  useEffect(() => {
    console.log("weekPlan:", weekPlan);
  }, [weekPlan]);

  return (
    <div className={"mainContainer" + (weekPlan.length === 0 ? "" : " user")}>
      <Header
        weekPlanLength={weekPlan.length}
        handleShow={handleShow}
        handleShow1={handleShow1}
      />
      <div className="gridContainer1">
        {weekPlan.length === 0 && (
          <>
            <div className="introContainer">
              <h2 className="title">Cоставление рациона питания</h2>
              <h4 className="description">
                Введите свои диетические предпочтения, чтобы составить план
                питания.
              </h4>
              <div className="inputContainer">
                <input
                  type="text"
                  value={userString}
                  onChange={(e) => setUserString(e.target.value)}
                  placeholder="Выдай мне рацион"
                  className="inputField"
                />
                <button onClick={handleButtonClick} className="getRationButton">
                  Создать
                </button>
              </div>

              <ModalComponent
                isOpen={modalIsOpen}
                closeModal={() => setModalIsOpen(false)}
                userString={userString}
                setWeekPlan={setWeekPlan}
              />
            </div>

            <div className="landingImageContainer">
              <Image
                src="/images/landing1.png"
                alt="landing"
                objectFit="cover"
                className="landingImage"
                width={650}
                height={725}
              />
            </div>
          </>
        )}
      </div>
      <div className="gridContainer2">
        <div className="gridContainer-item">
          <h2>Рекомендованные блюда:</h2>
          {todaysFood && todaysFood.length > 0 ? (
            <div>
              {todaysFood.map((food, index) => (
                <Accordion
                  key={index}
                  expanded={expanded === `panel${index + 1}`}
                  onChange={handleChange(`panel${index + 1}`)}
                >
                  <AccordionSummary
                    aria-controls={`panel${index + 1}d-content`}
                    id={`panel${index + 1}d-header`}
                  >
                    <Typography>{food.meal}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{food.description}</Typography>
                    {food.img_url && (
                      <img
                        src={food.img_url}
                        alt={food.meal}
                        style={{ maxWidth: "100%", marginTop: "10px" }}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          ) : (
            <p>No food items available for today.</p>
          )}
        </div>
        <div className="gridContainer-item">
          {weekPlan.length > 0 && (
            <Flicking circular={true} plugins={plugins}>
              {weekPlan.map((dayPlan) => (
                <div
                  key={dayPlan.date}
                  className="dayPlanCard card-panel"
                  onClick={() => handleCardClick(dayPlan)}
                  style={{
                    cursor: "pointer",
                    margin: "0 25px",
                    border: "2px solid #28511D",
                    borderRadius: "10px",
                  }}
                >
                  <div className="cardContent" style={{ padding: "20px" }}>
                    <h3 className="cardTitle">
                      {dayPlan.date} - {dayPlan.day}
                    </h3>
                    <div className="progressLabel">Progress</div>
                    <div className="progressBarContainer">
                      <Nested
                        circles={[
                          {
                            text: "Калории",
                            value: calculatePercentage(
                              dayPlan.nutritionSummary?.calories_filled || 0,
                              dayPlan.nutritionSummary?.calories || 100
                            ),
                            color: "#28511D",
                          },
                          {
                            text: "Белки",
                            value: calculatePercentage(
                              dayPlan.nutritionSummary?.protein_filled || 0,
                              dayPlan.nutritionSummary?.protein || 100
                            ),
                            color: "#0ea5e9",
                          },
                          {
                            text: "Жиры",
                            value: calculatePercentage(
                              dayPlan.nutritionSummary?.fats_filled || 0,
                              dayPlan.nutritionSummary?.fat || 100
                            ),
                            color: "#c2410c",
                          },
                          {
                            text: "Углеводы",
                            value: calculatePercentage(
                              dayPlan.nutritionSummary?.carbohydrates_filled ||
                                0,
                              dayPlan.nutritionSummary?.carbs || 100
                            ),
                            color: "#7c3aed",
                          },
                        ]}
                        sx={{
                          bgColor: "#cbd5e1",
                          fontWeight: "bold",
                          fontFamily: "Trebuchet MS",
                          strokeLinecap: "round",
                          loadingTime: 1000,
                          valueAnimation: true,
                          intersectionEnabled: true,
                        }}
                      />
                      <div className="progressText">
                        <strong>
                          {calculatePercentage(
                            dayPlan.nutritionSummary?.calories_filled || 0,
                            dayPlan.nutritionSummary?.calories || 100
                          ).toFixed(0)}
                          %
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <ViewportSlot>
                <div className="flicking-pagination"></div>
              </ViewportSlot>
            </Flicking>
          )}
        </div>
      </div>
      {/* {weekPlan.length > 0 && (
        <div className="addButtonContainer">
          <Button
            variant="primary"
            onClick={handleShow}
            style={{ backgroundColor: "#28511D" }}
          >
            Добавить прием пищи
          </Button>
        </div>
      )} */}
      <AddFoodModal
        show={showModal}
        handleClose={handleClose}
        updateNutritionData={updateNutritionData}
      />
       <AddMenuModal
        show1={showModal1}
        handleClose1={handleClose1}
        nutritionNeeded={calculateNutritionNeeded(todaysNutrition)}
      />
    </div>
  );
};

export default IndexPage;
