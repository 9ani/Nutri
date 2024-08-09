import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import NutritionProgress from "../components/NutritionProgress";
import NutritionDetails from "../components/NutritionDetails";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import DayPlanCard from "../components/DayPlanCard";
import ModalComponent from "../components/Modal";
import FoodHistoryPreview from "../components/FoodHistoryPreview";
import AddFoodModal from "../components/AddFoodModal";
import AddMenuModal from "../components/AddMenuModal";
import AuthModal from "../components/AuthModal";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Footer from "../components/Footer";

const Accordion = styled(MuiAccordion)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
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
  const [extendedWeekPlan, setExtendedWeekPlan] = useState([]);
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
  const [needExtendPlan, setNeedExtendPlan] = useState(false);
  const [showExtendPlanModal, setShowExtendPlanModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lastDayOfCurrentWeek, setLastDayOfCurrentWeek] = useState(null);

  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const sliderRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saveTempDataToDatabase = async (userId) => {
      const tempUserData = JSON.parse(localStorage.getItem("tempUserData"));
      const tempWeekPlan = JSON.parse(localStorage.getItem("tempWeekPlan"));

      if (tempUserData || tempWeekPlan) {
        try {
          if (tempUserData) {
            await fetch("/api/saveUserData", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userJson: tempUserData,
                userID: userId,
              }),
            });
            localStorage.removeItem("tempUserData");
          }

          if (tempWeekPlan) {
            const saveResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saveWeekPlan`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  weekPlan: tempWeekPlan,
                  userID: userId,
                }),
              }
            );
            if (saveResponse.ok) {
              const savedWeekPlan = await saveResponse.json();
              setWeekPlan(savedWeekPlan);
              localStorage.removeItem("tempWeekPlan");
            }
          }

          await fetchUserData(userId);
        } catch (error) {
          console.error("Failed to save user data from temp data:", error);
        }
      } else {
        await fetchUserData(userId);
      }
    };

    const fetchUserData = async (userId) => {
      try {
        const weekPlanResponse = await fetch(`/api/weekPlan?userId=${userId}`);
        const weekPlanData = await weekPlanResponse.json();
        if (weekPlanData && weekPlanData.weekPlan) {
          setWeekPlan(weekPlanData.weekPlan);
          localStorage.setItem(
            "weekPlan",
            JSON.stringify(weekPlanData.weekPlan)
          );
          checkIfNeedExtendPlan(weekPlanData.weekPlan);
        }

        // const tempWeekPlan = localStorage.getItem("tempWeekPlan");
        // if (tempWeekPlan) {
        //   const saveResponse = await fetch(
        //     `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saveWeekPlan`,
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify({
        //         weekPlan: JSON.parse(tempWeekPlan),
        //         userID: userId,
        //       }),
        //     }
        //   );
        //   if (saveResponse.ok) {
        //     const savedWeekPlan = await saveResponse.json();
        //     setWeekPlan(savedWeekPlan);
        //     localStorage.setItem("weekPlan", JSON.stringify(savedWeekPlan));
        //     localStorage.removeItem("tempWeekPlan");
        //     checkIfNeedExtendPlan(savedWeekPlan);
        //   }
        // }

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

    if (isSignedIn && user) {
      fetchUserData(user.id);
      saveTempDataToDatabase(user.id);
    } else {
      localStorage.removeItem("weekPlan");
      localStorage.removeItem("foodHistory");
      const tempWeekPlan = localStorage.getItem("tempWeekPlan");
      if (tempWeekPlan) {
        const parsedWeekPlan = JSON.parse(tempWeekPlan);
        setWeekPlan(parsedWeekPlan);
        setShowSignInPrompt(true);
        checkIfNeedExtendPlan(parsedWeekPlan);
      } else {
        setWeekPlan([]);
        setFoodHistory([]);
      }
      if (!isSignedIn && !hasJustSignedOut) {
        setHasJustSignedOut(true);
      }
    }
    setIsLoading(false);
  }, [isSignedIn, user, hasJustSignedOut]);

  useEffect(() => {
    setCurrentDate(new Date());

    if (weekPlan && weekPlan.length > 0) {
      const todayIndex = getTodayIndex(weekPlan);

      if (todayIndex !== -1) {
        setCurrentDayIndex(todayIndex);
        const todayPlan = weekPlan[todayIndex];
        setTodaysFood(
          todayPlan?.meals.map((meal) => ({
            ...meal,
            meal: translateMeal(meal.meal), // Translate meal names
            description: extractRussianDescription(meal.description), // Extract Russian description
          })) || []
        );
        setTodaysNutrition(todayPlan?.nutritionSummary ?? {});
        const lastDay = new Date(weekPlan[weekPlan.length - 1]?.date);
        if (!isNaN(lastDay)) {
          setLastDayOfCurrentWeek(lastDay);
        }
      }
    }
  }, [weekPlan]);

  const checkIfNeedExtendPlan = (weekPlan) => {
    if (!weekPlan || weekPlan.length === 0) {
      setNeedExtendPlan(false);
      setShowExtendPlanModal(false);
      return;
    }
    const today = new Date();
    const lastDayOfPlan =
      weekPlan.length > 0 ? new Date(weekPlan[weekPlan.length - 1].date) : null;
    if (
      lastDayOfPlan &&
      (today > lastDayOfPlan ||
        (today.toISOString().split("T")[0] ===
          lastDayOfPlan.toISOString().split("T")[0] &&
          currentDayIndex === weekPlan.length - 1))
    ) {
      setNeedExtendPlan(true);
      setShowExtendPlanModal(true);
    } else {
      setNeedExtendPlan(false);
      setShowExtendPlanModal(false);
    }
  };

  const getTodayIndex = (weekPlan) => {
    if (!weekPlan || weekPlan.length === 0) {
      return 0;
    }
    const today = new Date().toISOString().split("T")[0];
    return weekPlan.findIndex((dayPlan) => dayPlan.date === today);
  };
  
  const get7DayWindow = (weekPlan, todayIndex) => {
    if (!weekPlan || weekPlan.length === 0) {
      return [];
    }
    const startOfWeek = Math.max(0, Math.floor(todayIndex / 7) * 7);
    return weekPlan.slice(startOfWeek, startOfWeek + 7);
  };

  const getCurrentWeekPlan = (weekPlan, extendedWeekPlan) => {
    const now = new Date(currentDate);
    const nextWeekDate = new Date(now);
    nextWeekDate.setDate(now.getDate() + 7);

    const completeWeekPlan =
      weekPlan &&
      weekPlan.length === 0 &&
      extendedWeekPlan &&
      extendedWeekPlan.length > 0
        ? extendedWeekPlan
        : weekPlan || [];

    let displayPlan = [];

    if (completeWeekPlan.length > 0) {
      if (lastDayOfCurrentWeek && now <= lastDayOfCurrentWeek) {
        // If we haven't passed the last day of the current week, show only the current week
        displayPlan = completeWeekPlan.filter((dayPlan) => {
          const planDate = new Date(dayPlan.date);
          return planDate >= now && planDate <= nextWeekDate;
        });
      } else {
        // If we've passed the last day of the current week, include the extended plan
        displayPlan = [...completeWeekPlan].filter((dayPlan) => {
          const planDate = new Date(dayPlan.date);
          return planDate >= now && planDate <= nextWeekDate;
        });
      }
    }

    return displayPlan.slice(0, 7);
  };

  const isDateToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayIndex = getTodayIndex(weekPlan);
  const initialSliderIndex = todayIndex % 7;
  const sliderWeekPlan = get7DayWindow(weekPlan, todayIndex);

  const handleExtendPlan = async () => {
    if (isSignedIn && user) {
      try {
        const response = await fetch("/api/extendWeekPlan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userID: user.id }),
        });
        if (response.ok) {
          const extendedPlan = await response.json();
          setExtendedWeekPlan(extendedPlan);
          setCurrentDayIndex(0);
          setNeedExtendPlan(false);
          setShowExtendPlanModal(false);
        } else {
          console.error("Failed to extend week plan");
        }
      } catch (error) {
        console.error("Error extending week plan:", error);
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const SamplePrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className="slick-arrow slick-prev bg-custom-green text-white rounded-full w-10 h-10 flex items-center justify-center absolute left-0 z-10 transform -translate-y-1/2"
        style={{ ...style, display: "block", background: "#28511D" }}
        onClick={onClick}
      />
    );
  };

  const SampleNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className="slick-arrow slick-next bg-custom-green text-white rounded-full w-10 h-10 flex items-center justify-center absolute right-0 z-10 transform -translate-y-1/2"
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
    centerPadding: "50px", // Adjust padding here as needed
    focusOnSelect: true,
    initialSlide: initialSliderIndex,
    afterChange: (index) => {
      setCurrentDayIndex(index);
      const selectedDay = sliderWeekPlan[index];
      setTodaysFood(selectedDay?.meals ?? []);
      setTodaysNutrition(selectedDay?.nutritionSummary ?? {});

      // Update the classes for centering the active slide
      const sliderItems = document.querySelectorAll(".slide-item");
      sliderItems.forEach((item, i) => {
        item.classList.remove("active-slide");
        if (i === index) {
          item.classList.add("active-slide");
        }
      });
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
    if (!nutritionSummary) {
      return {
        calories_needed: 0,
        protein_needed: 0,
        fats_needed: 0,
        carbs_needed: 0,
      };
    }
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

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const currentWeekPlan = getCurrentWeekPlan(weekPlan, extendedWeekPlan);
  const currentCard =
    sliderWeekPlan.length > 0 ? sliderWeekPlan[currentDayIndex] : null;

  return (
    <div
      className={`${
        weekPlan && weekPlan.length > 0 ? "bg-white" : "bg-custom-green"
      } pt-12 pb-12 min-h-screen flex flex-col`}
    >
      <Header
        weekPlanLength={weekPlan ? weekPlan.length : 0}
        handleShow={handleShow}
        handleShow1={handleShow1}
        handleLogin={handleLogin}
        foodHistory={foodHistory}
        todaysNutrition={calculateNutritionNeeded(
          currentCard?.nutritionSummary
        )}
        setHasJustSignedOut={setHasJustSignedOut}
        setHasJustCreatedPlan={setHasJustCreatedPlan}
        setShowAuthModal={setShowAuthModal}
      />
      {showExtendPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Продлить план питания?</h2>
            <p className="mb-4">
              Ваш текущий план питания закончился. Хотите продлить его на
              следующую неделю?
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                onClick={() => setShowExtendPlanModal(false)}
              >
                Нет
              </button>
              <button
                className="bg-custom-green text-white px-4 py-2 rounded"
                onClick={handleExtendPlan}
              >
                Да, продлить план
              </button>
            </div>
          </div>
        </div>
      )}
      {(isSignedIn && weekPlan && weekPlan.length > 0) ||
      (!isSignedIn && weekPlan && weekPlan.length > 0) ? (
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 px-4 md:px-12 mt-8 md:mt-24 flex-grow">
          <div className="w-full md:w-1/2">
            {currentCard && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                  <NutritionProgress
                    nutritionSummary={
                      sliderWeekPlan[currentDayIndex]?.nutritionSummary
                    }
                    date={sliderWeekPlan[currentDayIndex]?.date}
                    />
                </div>
                <NutritionDetails
                  nutritionSummary={
                    sliderWeekPlan[currentDayIndex]?.nutritionSummary
                  }
                />
              </div>
            )}
            {currentWeekPlan && currentWeekPlan.length > 0 && (
              <div>
                <h2 className={`text-4xl font-bold text-custom-green  mb-4`}>
                  Рекомендованные блюда:
                </h2>
                {todaysFood &&
                  todaysFood.length > 0 &&
                  todaysFood.map((food, index) => (
                    <Accordion
                      key={index}
                      expanded={expanded === `panel${index + 1}`}
                      onChange={handleChange(`panel${index + 1}`)}
                    >
                      <AccordionSummary
                        aria-controls={`panel${index + 1}d-content`}
                        id={`panel${index + 1}d-header`}
                      >
                        <Typography>{translateMeal(food.meal)}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          {extractRussianDescription(food.description)}
                        </Typography>
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
            )}
          </div>
          <div className="w-full md:w-1/2">
            {sliderWeekPlan.length > 0 && (
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
                      {sliderWeekPlan.map((dayPlan, index) => (
                        <div
                          key={dayPlan.date}
                          className={`px-2 slide-item ${
                            isDateToday(dayPlan.date) ? "today-slide" : ""
                          }`}
                        >
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
                    dayPlan={sliderWeekPlan[currentDayIndex]}
                    handleCardClick={handleCardClick}
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() =>
                        setCurrentDayIndex((prev) => Math.max(0, prev - 1))
                      }
                      className="bg-custom-green text-white rounded-full w-10 h-10 flex items-center justify-center"
                      disabled={currentDayIndex === 0}
                    >
                      &#10094;
                    </button>
                    <button
                      onClick={() =>
                        setCurrentDayIndex((prev) =>
                          Math.min(sliderWeekPlan.length - 1, prev + 1)
                        )
                      }
                      className="bg-custom-green text-white rounded-full w-10 h-10 flex items-center justify-center"
                      disabled={currentDayIndex === sliderWeekPlan.length - 1}
                    >
                      &#10095;
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentWeekPlan.length > 0 && (
              <div className="mt-8">
                <FoodHistoryPreview foodHistory={foodHistory} />
              </div>
            )}
          </div>
        </div>
      ) : (
        (!isSignedIn || (isSignedIn && (!weekPlan || weekPlan.length === 0))) &&
        !isCreatingPlan && (
          <>
            <div className="flex flex-col lg:flex-row items-center justify-between flex-grow">
              {(!isSignedIn ||
                (isSignedIn && (!weekPlan || weekPlan.length === 0))) &&
                !isCreatingPlan && (
                  <div className="flex flex-col lg:flex-row items-center justify-between w-full min-h-screen bg-custom-green">
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                      <Image
                        src="/images/landing2.png"
                        alt="landing"
                        width={800}
                        height={900}
                        className="object-cover w-full h-auto"
                      />
                    </div>
                    <div className="w-full lg:w-1/2 px-8 lg:px-16 py-12 order-1 lg:order-2">
                      <h2 className="text-5xl lg:text-7xl  text-[#CEE422] mb-20 font-rubick2">
                        Составление рациона питания
                      </h2>
                      <h4 className="text-xl lg:text-2xl font-bold text-[#CEE422] mb-8">
                        Введите свои диетические предпочтения, чтобы составить
                        план питания.
                      </h4>
                      <div className="w-full ">
                        <button
                          onClick={handleButtonClick}
                          className="w-full bg-[#CEE422] text-custom-green rounded-lg text-xl font-bold py-4 px-8 transition duration-300 ease-in-out hover:bg-[#DAF23D] hover:shadow-lg"
                        >
                          Создать план питания
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
                        setHasJustCreatedPlan={setHasJustCreatedPlan}
                      />
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-custom-green help py-12">
              <div className="bg-custom-green pb-24">
                <div className="container mx-auto px-4">
                  <h1 className="text-5xl lg:text-6xl  text-[#CEE422] mb-16 text-center font-rubick2">
                    Как пользоваться системой
                  </h1>

                  <div className="mb-10">
                    {[
                      {
                        title: "1. Заполнение данных пользователя",
                        description:
                          "Введите ваши личные данные, предпочтения в еде и цели для создания персонализированного плана питания.",
                        image: "/images/fill_form.gif",
                      },
                      {
                        title: "2. Рекомендации по блюдам и недельный рацион",
                        description:
                          "Получите персонализированные рекомендации по блюдам и полный недельный план питания на основе ваших данных.",
                        image: "/images/cards.gif",
                      },
                      {
                        title: "3. Добавление еды и отслеживание прогресса",
                        description:
                          "Записывайте съеденные блюда и следите за своим прогрессом в достижении целей питания.",
                        image: "/images/progress.gif",
                      },
                      {
                        title: "4. Добавление меню и рекомендации блюд из кафе",
                        description:
                          "Добавляйте блюда из меню кафе и получайте рекомендации, соответствующие вашему плану питания.",
                        image: "/images/map.gif",
                      },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className="flex flex-col lg:flex-row items-center justify-between mt-10 lg:mt-20 gap-8 lg:gap-24"
                      >
                        <div
                          className={`w-full lg:w-1/2 ${
                            index % 2 === 0 ? "lg:order-1" : "lg:order-2"
                          }`}
                        >
                          <h2 className="text-3xl lg:text-4xl font-bold text-[#CEE422] mb-4">
                            {step.title}
                          </h2>
                          <p className="text-xl text-white mb-4">
                            {step.description}
                          </p>
                        </div>
                        <div
                          className={`w-full lg:w-1/2 mt-8 lg:mt-0 ${
                            index % 2 === 0 ? "lg:order-2" : "lg:order-1"
                          }`}
                        >
                          <div className="flex justify-center">
                            <Image
                              src={step.image}
                              alt={`GIF: ${step.title}`}
                              width={400}
                              height={300}
                              className="rounded-lg shadow-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-24">
                    <button
                      onClick={handleButtonClick}
                      className="bg-[#CEE422] text-custom-green text-2xl font-bold py-4 px-8 rounded-lg transition duration-300 ease-in-out hover:bg-[#DAF23D] hover:shadow-lg"
                    >
                      Начать пользоваться
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      )}
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
      <AuthModal
        show={showAuthModal && !isSignedIn && hasJustCreatedPlan}
        onClose={() => {
          setShowAuthModal(false);
          setHasJustCreatedPlan(false);
        }}
        setHasJustSignedOut={setHasJustSignedOut}
      />
      <Footer hasWeekPlan={weekPlan} />
    </div>
  );
};

// Function to translate meal names to Russian
const translateMeal = (meal) => {
  const translations = {
    Breakfast: "Завтрак",
    Lunch: "Обед",
    Dinner: "Ужин",
    Snack: "Перекус",
  };
  return translations[meal] || meal;
};

// Function to remove English descriptions from meal descriptions
const extractRussianDescription = (description) => {
  return description.replace(/\(.*?\)/, "").trim();
};

export default IndexPage;
