
function formatNumber(value, decimals = 0) {
    return value.toFixed(decimals);
  }
const DayPlanCard = ({ dayPlan, handleCardClick }) => (
    <div
      className="border-2 border-green-800 rounded-lg overflow-hidden w-full mx-auto cursor-pointer transition-all duration-300 hover:scale-105 bg-white shadow-lg"
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
            Калории: {formatNumber(Math.round(dayPlan.nutritionSummary.calories_filled))} /{' '}
            {formatNumber(Math.round(dayPlan.nutritionSummary.calories))}
          </p>
          <p>
            Белки: {formatNumber(Math.round(dayPlan.nutritionSummary.protein_filled))}g /{' '}
            {formatNumber(Math.round(dayPlan.nutritionSummary.protein))}g
          </p>
          <p>
            Жиры: {formatNumber(Math.round(dayPlan.nutritionSummary.fats_filled))}g /{' '}
            {formatNumber(Math.round(dayPlan.nutritionSummary.fats))}g
          </p>
          <p>
            Углеводы: {formatNumber(Math.round(dayPlan.nutritionSummary.carbohydrates_filled))}g /{' '}
            {formatNumber(Math.round(dayPlan.nutritionSummary.carbohydrates))}g
          </p>
        </div>
      </div>
    </div>
  );

export default DayPlanCard;