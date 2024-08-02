import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import ProgressBar from "react-bootstrap/ProgressBar"; // Import ProgressBar from react-bootstrap

Modal.setAppElement("#__next");

const ModalComponent = ({
  isOpen,
  closeModal,
  onSubmit,
  setWeekPlan,
  userID,
  setShowAuthModal,
  setHasJustCreatedPlan, // Add this parameter
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("male");
  const [allergies, setAllergies] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
  const [goals, setGoals] = useState("");
  const [physicalActivity, setPhysicalActivity] = useState("");
  const [goalCompletionTime, setGoalCompletionTime] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const loadingTexts = [
    "Мы составляем ваш рацион...",
    "Ищем нужные ингредиенты...",
    "Рассчитываем калории и питательные вещества...",
    "Подбираем оптимальные блюда...",
  ];

  useEffect(() => {
    if (isSubmitting) {
      let index = 0;
      const interval = setInterval(() => {
        setLoadingText(loadingTexts[index]);
        index = (index + 1) % loadingTexts.length;
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isSubmitting]);

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 8 && validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (age < 1 || age > 120) {
          setError("Пожалуйста, введите корректный возраст (от 1 до 120 лет)");
          return false;
        }
        break;
      case 2:
        if (weight < 20 || weight > 300) {
          setError("Пожалуйста, введите корректный вес (от 20 до 300 кг)");
          return false;
        }
        if (height < 100 || height > 250) {
          setError("Пожалуйста, введите корректный рост (от 100 до 250 см)");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === "" || (parseInt(value) >= 0 && !isNaN(parseInt(value)))) {
      setter(value);
    }
  };

  const handleClickableInput = (field, value) => {
    switch (field) {
      case "allergies":
        setAllergies((prev) => (prev ? `${prev}, ${value}` : value));
        break;
      case "dietaryPreferences":
        setDietaryPreferences((prev) => (prev ? `${prev}, ${value}` : value));
        break;
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 8) {
      handleNext(e);
      return;
    }
    setIsSubmitting(true);

    const userJson = {
      age: parseInt(age),
      weight: parseInt(weight),
      height: parseInt(height),
      gender,
      allergies: allergies.split(",").map((item) => item.trim()),
      dietaryPreferences: dietaryPreferences
        .split(",")
        .map((item) => item.trim()),
      goals,
      physicalActivity,
      goalCompletionTime,
    };
    localStorage.setItem("tempUserData", JSON.stringify(userJson));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/ration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userJson, userID }), // Pass userID here
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to submit data: ${response.statusText}`);
      }

      const responseData = await response.json();
      if (userID) {
        // If user is signed in, save the week plan immediately
        const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/saveWeekPlan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            weekPlan: responseData,
            userID: userID,
          }),
        });
        if (saveResponse.ok) {
          const savedWeekPlan = await saveResponse.json();
          setWeekPlan(savedWeekPlan);
        } else {
          throw new Error("Failed to save week plan");
        }
      } else {
        // If user is not signed in, store in localStorage
        localStorage.setItem("tempWeekPlan", JSON.stringify(responseData));
      }
      setIsSubmitting(false);
      closeModal();
      setHasJustCreatedPlan(true);
      setShowAuthModal(!userID);
    } catch (error) {
      setIsSubmitting(false);
      setError(error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Введите ваши данные
        </h2>
        <ProgressBar
          now={(currentStep / 8) * 100}
          label={`${currentStep}`}
          className="mb-6"
        />

        {isSubmitting ? (
          <div className="text-center mt-4">
            <p className="text-gray-500">{loadingText}</p>
            <div className="loader mt-4"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === 1 && (
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="age">
                  Возраст
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={handleInputChange(setAge)}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="weight"
                >
                  Вес (кг)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={handleInputChange(setWeight)}
                  min="20"
                  max="300"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <label
                  className="block text-sm font-bold mt-4 mb-2"
                  htmlFor="height"
                >
                  Рост (см)
                </label>
                <input
                  type="number"
                  id="height"
                  value={height}
                  onChange={handleInputChange(setHeight)}
                  min="100"
                  max="250"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}
            {currentStep === 3 && (
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="gender"
                >
                  Пол
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            )}
            {currentStep === 4 && (
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="allergies"
                >
                  Аллергии (через запятую)
                </label>
                <input
                  type="text"
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {["Молоко", "Яйца", "Орехи", "Рыба"].map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => handleClickableInput("allergies", allergy)}
                      className="px-2 py-1 bg-gray-200 rounded-md text-sm"
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {currentStep === 5 && (
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="dietaryPreferences"
                >
                  Диетические предпочтения (через запятую)
                </label>
                <input
                  type="text"
                  id="dietaryPreferences"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {["Вегетарианец", "Безглютеновый", "Лактозный"].map(
                    (pref) => (
                      <button
                        key={pref}
                        type="button"
                        onClick={() =>
                          handleClickableInput("dietaryPreferences", pref)
                        }
                        className="px-2 py-1 bg-gray-200 rounded-md text-sm"
                      >
                        {pref}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
            {currentStep === 6 && (
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="goals">
                  Цели
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setGoals("быть в форме")}
                    className={`w-full px-4 py-2 border rounded-md ${
                      goals === "быть в форме" ? "bg-green-200" : "bg-gray-200"
                    }`}
                  >
                    Быть в форме
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoals("набрать массу")}
                    className={`w-full px-4 py-2 border rounded-md ${
                      goals === "набрать массу" ? "bg-green-200" : "bg-gray-200"
                    }`}
                  >
                    Набрать массу
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoals("похудеть")}
                    className={`w-full px-4 py-2 border rounded-md ${
                      goals === "похудеть" ? "bg-green-200" : "bg-gray-200"
                    }`}
                  >
                    Похудеть
                  </button>
                </div>
              </div>
            )}
            {currentStep === 7 && (
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="physicalActivity"
                >
                  Физическая активность
                </label>
                <select
                  id="physicalActivity"
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="none">
                    Минимум/Отсутствие физической нагрузки
                  </option>
                  <option value="2_times_week">2 раза в неделю</option>
                  <option value="5_times_week">5 раз в неделю</option>
                  <option value="5_times_week_intensive">
                    5 раз в неделю (интенсивно)
                  </option>
                  <option value="every_day">Каждый день</option>
                  <option value="every_day_intensive">
                    Каждый день интенсивно или два раза в день
                  </option>
                  <option value="daily_physical_work">
                    Ежедневная физическая нагрузка + физическая работа
                  </option>
                </select>
              </div>
            )}
            {currentStep === 8 && (
              <div>
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="goalCompletionTime"
                >
                  В течение какого времени вы хотите достичь цели?
                </label>
                <input
                  type="text"
                  id="goalCompletionTime"
                  value={goalCompletionTime}
                  onChange={(e) => setGoalCompletionTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <div className="flex flex-wrap gap-2 mb-2">
                  {["3 месяца", "6 месяцев", "1 год"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setGoalCompletionTime(time)}
                      className="px-2 py-1 bg-gray-200 rounded-md text-sm"
                    >
                      {time}
                    </button>
                  ))}
                </div>
                
              </div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border rounded-md bg-gray-200"
                >
                  Назад
                </button>
              )}
              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 border rounded-md bg-green-200"
                >
                  Далее
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 border rounded-md bg-green-200"
                >
                  Отправить
                </button>
              )}
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ModalComponent;
