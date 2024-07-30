import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "react-bootstrap/ProgressBar";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Button from "react-bootstrap/Button";

const DayDetail = () => {
  const router = useRouter();
  const { date } = router.query;
  const [dayPlan, setDayPlan] = useState(null);

  useEffect(() => {
    const storedWeekPlan = localStorage.getItem("weekPlan");

    if (storedWeekPlan) {
      const parsedWeekPlan = JSON.parse(storedWeekPlan);
      const selectedDayPlan = parsedWeekPlan.find((plan) => plan.date === date);

      if (selectedDayPlan) {
        setDayPlan(selectedDayPlan);
      }
    }
  }, [date]);

  if (!dayPlan) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  const handleBack = () => {
    router.back();
  };
  const renderMeals = () => {
    return dayPlan.meals.map((meal, index) => (
      <div key={index} className="bg-gray-100 p-6 rounded-lg mb-6 shadow-md">
        <h4 className="font-bold text-xl text-green-800 mb-2">{meal.meal}</h4>
        <p className="text-gray-700">{meal.description}</p>
      </div>
    ));
  };

  const convertToNumber = (value) => {
    if (typeof value !== "string") {
      console.warn("convertToNumber received a non-string value:", value);
      return 0;
    }

    const extractedNumber = parseFloat(value.replace(/[^\d.-]/g, ""));
    return isNaN(extractedNumber) ? 0 : extractedNumber;
  };

  const calculatePercentage = (current, max) => {
    if (typeof current !== "number" || typeof max !== "number" || max === 0) {
      return 0;
    }
    return Math.round((current / max) * 100);
  };

  const renderProgressBars = (data) => {
    return Object.entries(data)
      .filter(([key, value]) => key.endsWith("_filled"))
      .map(([key, value]) => {
        const nutrientName = key.replace("_filled", "");
        const filledValue = value;
        const maxValue = convertToNumber(data[nutrientName]) || 1;

        if (
          typeof filledValue === "number" &&
          typeof maxValue === "number" &&
          maxValue !== 0
        ) {
          return (
            <div key={key} className="mb-4">
              <strong className="text-green-800">
                {nutrientName.charAt(0).toUpperCase() + nutrientName.slice(1)}
              </strong>
              <ProgressBar
                now={calculatePercentage(filledValue, maxValue)}
                label={`${calculatePercentage(filledValue, maxValue)}%`}
                variant="success"
                className="h-8"
              />
            </div>
          );
        }
        return null;
      });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg">
      <Button
          onClick={handleBack}
          variant="outline-secondary"
          className="mb-4"
        >
          Назад
        </Button>
        <Card className="border-0">
          <Card.Body>
            <Card.Title className="text-3xl font-bold mb-6 text-green-800">{dayPlan.date}</Card.Title>
            <div className="mb-6">
              <strong className="text-xl text-green-800">Calories</strong>
              <ProgressBar
                now={calculatePercentage(
                  dayPlan.nutritionSummary.calories_filled || 0,
                  convertToNumber(dayPlan.nutritionSummary.calories) || 1
                )}
                label={`Calories ${calculatePercentage(
                  dayPlan.nutritionSummary.calories_filled || 0,
                  convertToNumber(dayPlan.nutritionSummary.calories) || 1
                )}%`}
                variant="success"
                className="h-8 mt-2"
              />
            </div>

            <h4 className="text-2xl font-semibold mt-8 mb-4 text-green-800">Vitamins</h4>
            {renderProgressBars(dayPlan.nutritionSummary.vitamins)}

            <h4 className="text-2xl font-semibold mt-8 mb-4 text-green-800">Minerals</h4>
            {renderProgressBars(dayPlan.nutritionSummary.minerals)}

            <h4 className="text-2xl font-semibold mt-8 mb-4 text-green-800">Macronutrients</h4>
            {renderProgressBars(dayPlan.nutritionSummary)}

            <h4 className="text-2xl font-semibold mt-8 mb-4 text-green-800">Meals</h4>
            {renderMeals()}
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DayDetail;