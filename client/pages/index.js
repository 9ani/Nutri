import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import NutritionProgress from "../components/NutritionProgress";
import NutritionDetails from "../components/NutritionDetails";
import { useSession } from "next-auth/react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "react-bootstrap/Button";
import AddFoodModal from "../components/AddFoodModal";
import AddMenuModal from "../components/AddMenuModal";
import ModalComponent from "../components/Modal";
import FoodHistoryPreview from "../components/FoodHistoryPreview";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
import { Arrow } from "@egjs/flicking-plugins";
import "@egjs/flicking/dist/flicking.css";
import "@egjs/flicking-plugins/dist/arrow.css";
require('dotenv').config();

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [foodHistory, setFoodHistory] = useState([]);
  const flickingRef = useRef(null);
  const { isSignedIn, user } = useUser();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const sliderRef = useRef(null);
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const plugins = [new Pagination({ type: "scroll" })];
  const [isLoading, setIsLoading] = useState(true);

  if (isSignedIn && user) {
    console.log("User ID:", user.id);
    console.log("User Data:", user);
    // You can log more user information if needed
  }

  useEffect(() => {
    if (weekPlan.length > 0) {
      const todayIndex = weekPlan.findIndex(
        (dayPlan) => dayPlan.date === today
      );
      if (todayIndex >= 0) {
        setCurrentDayIndex(todayIndex);
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(todayIndex);
        }
      }
    }
  }, [weekPlan, today]);
  const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className="slick-arrow slick-prev bg-green-800 text-white rounded-full w-10 h-10 flex items-center justify-center absolute left-0 z-10 transform -translate-y-1/2"
        style={{ ...style, display: "block", background: "#28511D" }}
        onClick={onClick}
      />
    );
  };

  const SampleNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className="slick-arrow slick-next bg-green-800 text-white rounded-full w-10 h-10 flex items-center justify-center absolute right-0 z-10 transform -translate-y-1/2"
        style={{ ...style, display: "block", background: "#28511D" }}
        onClick={onClick}
      />
    );
  };
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "200px",
    focusOnSelect: true,
    autoplay: false,
    arrows: true,
    initialSlide: currentDayIndex,
    afterChange: (index) => {
      setCurrentDayIndex(index);
      const selectedDay = weekPlan[index];
      setTodaysFood(selectedDay.meals);
      setTodaysNutrition(selectedDay.nutritionSummary);
    },
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
  };

  useEffect(() => {
    if (isSignedIn && user) {
      fetchUserData(user.id);
    } else {
      // Clear local storage when user is not signed in
      localStorage.removeItem("weekPlan");
      localStorage.removeItem("foodHistory");
      setWeekPlan([]);
      setFoodHistory([]);
    }
  }, [isSignedIn, user]);

  const calculatePercentage = (filled, max) => {
    if (max === 0) return 0;
    return Math.min((filled / max) * 100, 100);
  };

  // useEffect(() => {
  //   if (status === "loading") return; // Do nothing while loading
  //   if (!session) router.push('/auth/signin'); // Redirect if not logged in
  // }, [session, status]);

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
      setIsLoading(false);

      getTodaysFoodAndNutrition(weekPlan, today).then(
        ({ todaysFood, todaysNutrition }) => {
          setTodaysFood(todaysFood);
          setTodaysNutrition(todaysNutrition);
          console.log("todaysFood:", todaysFood);
          console.log("todaysNutrition:", todaysNutrition);
        }
      );
    }
  }, [weekPlan, today]);
  useEffect(() => {
    if (weekPlan.length > 0) {
      const todayIndex = weekPlan.findIndex(
        (dayPlan) => dayPlan.date === today
      );
      if (todayIndex >= 0) {
        setCurrentDayIndex(todayIndex);
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(todayIndex);
        }
      }
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

  const handleLogin = () => {
    setShowLoginModal(true);
  };
  const closeLoginModal = () => {
    setShowLoginModal(false);
  };
  const handleButtonClick = () => {
    setModalIsOpen(true);
  };

  const fetchUserData = async (userId) => {
    try {
      // Fetch Week Plan
      const weekPlanResponse = await fetch(`/api/weekPlan?userId=${userId}`);
      const weekPlanData = await weekPlanResponse.json();
      if (weekPlanData.weekPlan) {
        setWeekPlan(weekPlanData.weekPlan);
        localStorage.setItem("weekPlan", JSON.stringify(weekPlanData.weekPlan));
      }

      // Fetch Food History
      const foodHistoryResponse = await fetch(
        `/api/foodHistory?userId=${userId}`
      );
      const foodHistoryData = await foodHistoryResponse.json();
      if (foodHistoryData.foodHistory) {
        setFoodHistory(foodHistoryData.foodHistory);
        localStorage.setItem(
          "foodHistory",
          JSON.stringify(foodHistoryData.foodHistory)
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
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
  const addFoodHistory = (newFoodHistory) => {
    setFoodHistory(newFoodHistory);
    localStorage.setItem("FoodHistory", JSON.stringify(newFoodHistory));

    console.log("newFoodHistory:", newFoodHistory);
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
  function formatNumber(value, decimals = 0) {
    return value.toFixed(decimals);
  }

  useEffect(() => {
    if (weekPlan.length > 0 && flickingRef.current) {
      const todayPlanIndex = weekPlan.findIndex(
        (dayPlan) => dayPlan.date === today
      );
      if (todayPlanIndex >= 0) {
        flickingRef.current.moveTo(todayPlanIndex, true); // Center today's card
      }
    }
  }, [weekPlan, today]);
  useEffect(() => {
    console.log("showModal state:", showModal);
  }, [showModal]);

  useEffect(() => {
    console.log("weekPlan:", weekPlan);
  }, [weekPlan]);

  return (
    <div
      className={`bg-green-800 ${
        weekPlan.length === 0 ? "" : "bg-white"
      } pt-12`}
    >
      <Header
        weekPlanLength={weekPlan.length}
        handleShow={handleShow}
        handleShow1={handleShow1}
        handleLogin={handleLogin}
        foodHistory={foodHistory}
        todaysNutrition={calculateNutritionNeeded(todaysNutrition)}
      />
      <div className="flex items-center justify-between">
        {weekPlan.length === 0 && (
          <>
            <div className="ml-16 w-3/4">
              <h2 className="text-6xl font-bold text-[#CEE422] mb-8">
                Cоставление рациона питания
              </h2>
              <h4 className="text-xl font-bold text-[#CEE422] w-2/3 mb-8">
                Введите свои диетические предпочтения, чтобы составить план
                питания.
              </h4>
              <div className="flex gap-4 w-full h-16">
                <button
                  onClick={handleButtonClick}
                  className="w-1/2 bg-[#CEE422] rounded-lg text-lg"
                >
                  Создать
                </button>
              </div>
              <ModalComponent
                isOpen={modalIsOpen}
                closeModal={() => setModalIsOpen(false)}
                setWeekPlan={setWeekPlan}
                userID={user ? user.id : null}
              />
            </div>
            <div className="w-1/2">
              <Image
                src="/images/landing1.png"
                alt="landing"
                width={650}
                height={725}
                className="object-cover"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-12 px-4 md:px-12 mt-8 md:mt-24">
        <div className="w-full md:w-1/2">
          {weekPlan.length > 0 && weekPlan[currentDayIndex] && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <NutritionProgress
                  nutritionSummary={weekPlan[currentDayIndex].nutritionSummary}
                  date={weekPlan[currentDayIndex].date}
                />
              </div>
              <div className="w-full md:w-1/2">
                <NutritionDetails
                  nutritionSummary={weekPlan[currentDayIndex].nutritionSummary}
                />
              </div>
            </div>
          )}
          <h2 className="text-4xl font-bold text-green-800 mb-4">
            Рекомендованные блюда:
          </h2>
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
                        className="w-full mt-2"
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          ) : (
            <p></p>
          )}
        </div>
        <div className="w-full md:w-1/2">

          {weekPlan.length > 0 && (
            <div className="relative px-2 md:px-10">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <Slider ref={sliderRef} {...settings} className="custom-slider">
                  {weekPlan.map((dayPlan, index) => (
                    <div
                      key={dayPlan.date}
                      className="border-2 border-green-800 rounded-lg overflow-hidden w-full md:w-11/12 mx-auto cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => handleCardClick(dayPlan)}
                    >
                      <div className="p-4 h-full flex flex-col min-h-[400px] md:h-[400px]">
                        <h3 className="text-xl font-bold mb-2">
                          {dayPlan.date} - {dayPlan.day}
                        </h3>
                        <div className="flex-grow overflow-auto mb-4">
                          {dayPlan.meals.map((meal, mealIndex) => (
                            <p key={mealIndex} className="mb-1">
                              <strong>{meal.meal}:</strong> {meal.description}
                            </p>
                          ))}
                        </div>
                        <div className="mt-auto">
                          <h4 className="font-bold mb-2">Питание</h4>
                          <p>
                            Калории:{" "}
                            {formatNumber(
                              Math.round(
                                dayPlan.nutritionSummary.calories_filled
                              )
                            )}{" "}
                            /{" "}
                            {formatNumber(
                              Math.round(dayPlan.nutritionSummary.calories)
                            )}
                          </p>
                          <p>
                            Белки:{" "}
                            {formatNumber(
                              Math.round(
                                dayPlan.nutritionSummary.protein_filled
                              )
                            )}
                            g /{" "}
                            {formatNumber(
                              Math.round(dayPlan.nutritionSummary.protein)
                            )}
                            g
                          </p>
                          <p>
                            Жиры:{" "}
                            {formatNumber(
                              Math.round(dayPlan.nutritionSummary.fats_filled)
                            )}
                            g /{" "}
                            {formatNumber(
                              Math.round(dayPlan.nutritionSummary.fats)
                            )}
                            g
                          </p>
                          <p>
                            Углеводы:{" "}
                            {formatNumber(
                              Math.round(
                                dayPlan.nutritionSummary.carbohydrates_filled
                              )
                            )}
                            g /{" "}
                            {formatNumber(
                              Math.round(dayPlan.nutritionSummary.carbohydrates)
                            )}
                            g
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              )}
                      <FoodHistoryPreview foodHistory={foodHistory} />

            </div>
            
          )}
          
        </div>
      </div>
      
      <AddFoodModal
        show={showModal}
        handleClose={handleClose}
        updateNutritionData={updateNutritionData}
        userID={user ? user.id : null}
        addFoodHistory={addFoodHistory}
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
