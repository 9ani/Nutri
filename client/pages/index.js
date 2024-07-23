import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import NutritionProgress from "../components/NutritionProgress";
import NutritionDetails from "../components/NutritionDetails";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Button from "react-bootstrap/Button";
import AddFoodModal from "../components/AddFoodModal";
import AddMenuModal from "../components/AddMenuModal";
import ModalComponent from "../components/Modal";
import AuthModal from "../components/AuthModal";
import FoodHistoryPreview from "../components/FoodHistoryPreview";
import DayPlanCard from "../components/DayPlanCard";
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
import { styled } from "@mui/material/styles";

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [todaysNutrition, setTodaysNutrition] = useState({});
  const [todaysFood, setTodaysFood] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [foodHistory, setFoodHistory] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [hasJustSignedOut, setHasJustSignedOut] = useState(false);
  const [hasJustCreatedPlan, setHasJustCreatedPlan] = useState(false);

  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const sliderRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isSignedIn && user) {
      fetchUserData(user.id);
      setHasJustSignedOut(false);
    } else {
      localStorage.removeItem("weekPlan");
      localStorage.removeItem("foodHistory");
  
      const tempWeekPlan = localStorage.getItem("tempWeekPlan");
  
      if (tempWeekPlan) {
        setWeekPlan(JSON.parse(tempWeekPlan));
        setShowSignInPrompt(true);
      } else {
        setWeekPlan([]);
        setFoodHistory([]);
      }
      if (!isSignedIn && !hasJustSignedOut ) {
        setHasJustSignedOut(true);
      }
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (weekPlan.length > 0) {
      setIsLoading(false);
      setIsCreatingPlan(false);
      if (!isSignedIn && !hasJustSignedOut) {
        setShowAuthModal(true);
        setHasJustCreatedPlan(false);
      }
  
      getTodaysFoodAndNutrition(weekPlan, today).then(
        ({ todaysFood, todaysNutrition }) => {
          setTodaysFood(todaysFood);
          setTodaysNutrition(todaysNutrition);
        }
      );
  
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
  }, [weekPlan, today, isSignedIn, hasJustSignedOut]);

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
    slidesToShow: 2,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "60px",
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
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "20px",
        },
      },
    ],
  };

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

  const handleShow = () => setShowModal(true);
  const handleShow1 = () => setShowModal1(true);
  const handleClose = () => setShowModal(false);
  const handleClose1 = () => setShowModal1(false);
  const handleLogin = () => setShowLoginModal(true);
  const handleButtonClick = () => setModalIsOpen(true);

  const fetchUserData = async (userId) => {
    try {
      const weekPlanResponse = await fetch(`/api/weekPlan?userId=${userId}`);
      const weekPlanData = await weekPlanResponse.json();
      if (weekPlanData.weekPlan) {
        setWeekPlan(weekPlanData.weekPlan);
        localStorage.setItem("weekPlan", JSON.stringify(weekPlanData.weekPlan));
      }

      const tempWeekPlan = localStorage.getItem("tempWeekPlan");
      if (tempWeekPlan) {
        const saveResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saveWeekPlan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              weekPlan: JSON.parse(tempWeekPlan),
              userID: userId,
            }),
          }
        );
        if (saveResponse.ok) {
          const savedWeekPlan = await saveResponse.json();
          setWeekPlan(savedWeekPlan);
          localStorage.setItem("weekPlan", JSON.stringify(savedWeekPlan));
          localStorage.removeItem("tempWeekPlan");
        } else {
          throw new Error(
            `Failed to save week plan: ${saveResponse.statusText}`
          );
        }
      }

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
    router.push({
      pathname: `/day/${dayPlan.date}`,
      query: { dayPlan: JSON.stringify(dayPlan) },
    });
  };

  const addFoodHistory = (newFoodHistory) => {
    setFoodHistory(newFoodHistory);
    localStorage.setItem("FoodHistory", JSON.stringify(newFoodHistory));
  };

  const updateNutritionData = (updatedWeekPlan) => {
    setWeekPlan(updatedWeekPlan);
    localStorage.setItem("weekPlan", JSON.stringify(updatedWeekPlan));
  };

  const getTodaysFoodAndNutrition = async (weekPlan, today) => {
    try {
      const todayPlan = weekPlan.find((dayPlan) => dayPlan.date === today);
      if (todayPlan) {
        return {
          todaysFood: todayPlan.meals,
          todaysNutrition: todayPlan.nutritionSummary,
        };
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
      <div className="flex flex-col lg:flex-row items-center justify-between">
        {weekPlan.length === 0 && !isCreatingPlan && (
          <>
            <div className="w-full lg:w-3/4 mb-8 lg:mb-0 lg:ml-16">
              <h2 className="text-4xl lg:text-6xl font-bold text-[#CEE422] mb-4 lg:mb-8 lg:w-2/3">
                Cоставление рациона питания
              </h2>
              <h4 className="text-lg lg:text-xl font-bold text-[#CEE422] w-full lg:w-2/3 mb-4 lg:mb-8">
                Введите свои диетические предпочтения, чтобы составить план
                питания.
              </h4>
              <div className="flex gap-4 w-full lg:w-2/3 h-12 lg:h-16">
                <button
                  onClick={handleButtonClick}
                  className="w-full bg-[#CEE422] rounded-lg text-base lg:text-lg"
                >
                  Создать
                </button>
              </div>
              <ModalComponent
                isOpen={modalIsOpen}
                closeModal={() => setModalIsOpen(false)}
                setWeekPlan={(plan) => {
                  setWeekPlan(plan);
                  setIsCreatingPlan(true);
                  setHasJustCreatedPlan(true); 
                }}
                userID={user ? user.id : null}
                setShowAuthModal={setShowAuthModal}
              />
            </div>
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <Image
                src="/images/landing1.png"
                alt="landing"
                width={650}
                height={725}
                className="object-cover w-full h-auto"
              />
            </div>
          </>
        )}
        {/* {showSignInPrompt && !isSignedIn && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-bold text-[#CEE422] mb-4">
              Ваш план питания готов!
            </h2>
            {!user && (
              <p className="text-[#CEE422] mb-4">
                Для сохранения и дальнейшего использования плана, пожалуйста,
                войдите в систему.
              </p>
            )}
            <button
              onClick={() => (user ? null : router.push("/sign-in"))}
              className="bg-[#CEE422] rounded-lg text-base lg:text-lg px-4 py-2"
            >
              {user ? "Продолжить" : "Войти"}
            </button>
          </div>
        )} */}
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

          {weekPlan && weekPlan.length > 0 ? (
            <div>
              <h2 className="text-4xl font-bold text-green-800 mb-4">
                Рекомендованные блюда:
              </h2>
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
            <div className="relative w-full px-4 md:px-10">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="hidden md:block">
                  <Slider
                    ref={sliderRef}
                    {...settings}
                    className="custom-slider"
                  >
                    {weekPlan.map((dayPlan, index) => (
                      <div key={dayPlan.date} className="px-2">
                        <DayPlanCard
                          dayPlan={dayPlan}
                          handleCardClick={handleCardClick}
                        />
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
              <div className="md:hidden">
                <DayPlanCard
                  dayPlan={weekPlan[currentDayIndex]}
                  handleCardClick={handleCardClick}
                />
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() =>
                      setCurrentDayIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="bg-green-800 text-white rounded-full w-10 h-10 flex items-center justify-center"
                    disabled={currentDayIndex === 0}
                  >
                    &#10094;
                  </button>
                  <button
                    onClick={() =>
                      setCurrentDayIndex((prev) =>
                        Math.min(weekPlan.length - 1, prev + 1)
                      )
                    }
                    className="bg-green-800 text-white rounded-full w-10 h-10 flex items-center justify-center"
                    disabled={currentDayIndex === weekPlan.length - 1}
                  >
                    &#10095;
                  </button>
                </div>
              </div>
            </div>
          )}
          {weekPlan.length > 0 && (
            <div className="mt-8">
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
      <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default IndexPage;
