import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProgressBar from "react-bootstrap/ProgressBar";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../../components/Header";

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
    return <div>Loading...</div>;
  }

  const renderMeals = () => {
    return dayPlan.meals.map((meal, index) => (
      <div key={index} className="mb-4">
        <h4>{meal.meal}</h4>
        <p>{meal.description}</p>
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
            <div key={key} className="mb-3">
              <strong>
                {nutrientName.charAt(0).toUpperCase() + nutrientName.slice(1)}
              </strong>
              <ProgressBar
                now={calculatePercentage(filledValue, maxValue)}
                label={`${calculatePercentage(filledValue, maxValue)}%`}
                variant="primary"
              />
            </div>
          );
        }
        return null;
      });
  };

  return (
    <div>
      <Header />
      <div className="container mt-5">
        <Card>
          <Card.Body>
            <Card.Title>{dayPlan.date}</Card.Title>
            <div className="mb-3">
              <strong>Calories</strong>
              <ProgressBar
                now={calculatePercentage(
                  dayPlan.nutritionSummary.calories_filled || 0,
                  convertToNumber(dayPlan.nutritionSummary.calories) || 1
                )}
                label={`Calories ${calculatePercentage(
                  dayPlan.nutritionSummary.calories_filled || 0,
                  convertToNumber(dayPlan.nutritionSummary.calories) || 1
                )}%`}
                variant="primary"
              />
            </div>

            <h4>Vitamins</h4>
            {renderProgressBars(dayPlan.nutritionSummary.vitamins)}

            <h4>Minerals</h4>
            {renderProgressBars(dayPlan.nutritionSummary.minerals)}

            <h4>Macronutrients</h4>
            {renderProgressBars(dayPlan.nutritionSummary)}

            <h4>Meals</h4>
            {renderMeals()}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DayDetail;
