import { Flat, Heat, Nested } from "@alptugidin/react-circular-progress-bar";


const NutritionProgress = ({ nutritionSummary, date }) => {
  const calculatePercentage = (filled, max) => {
    if (max === 0) return 0;
    return Math.min((filled / max) * 100, 100);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-[#28511D] text-2xl font-bold mb-4">{date}</h3>

      <div className="w-80 h-80">
        <Nested
          circles={[
            {
              text: "Калории",
              value: calculatePercentage(
                nutritionSummary?.calories_filled || 0,
                nutritionSummary?.calories || 100
              ),
              color: "#28511D",
            },
            {
              text: "Белки",
              value: calculatePercentage(
                nutritionSummary?.protein_filled || 0,
                nutritionSummary?.protein || 100
              ),
              color: "#CEE422",
            },
            {
              text: "Жиры",
              value: calculatePercentage(
                nutritionSummary?.fats_filled || 0,
                nutritionSummary?.fat || 100
              ),
              color: "#28511D",
            },
            {
              text: "Углеводы",
              value: calculatePercentage(
                nutritionSummary?.carbohydrates_filled || 0,
                nutritionSummary?.carbohydrates || 100
              ),
              color: "#CEE422",
            },
          ]}
          sx={{
            bgColor: "#f0f0f0",
            fontWeight: "bold",
            fontFamily: "Trebuchet MS",
            strokeLinecap: "round",
            loadingTime: 1000,
            valueAnimation: true,
            intersectionEnabled: true,
          }}
        />
      </div>
      
    </div>
  );
};

export default NutritionProgress;