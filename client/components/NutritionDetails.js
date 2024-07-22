const NutritionDetails = ({ nutritionSummary }) => {
    // Function to round the number and format it
    const roundValue = (value) => Math.round(value);
  
    return (
      <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col justify-between">
        <h4 className="text-[#28511D] text-xl font-bold mb-4">Подробная информация о питании</h4>
        <div className="grid grid-cols-1 gap-4 flex-grow">
          <div className="bg-[#CEE422] p-3 rounded">
            <p className="text-[#28511D]">Калории: {roundValue(nutritionSummary.calories_filled)} / {roundValue(nutritionSummary.calories)}</p>
          </div>
          <div className="bg-[#CEE422] p-3 rounded">
            <p className="text-[#28511D]">Белки: {roundValue(nutritionSummary.protein_filled)}g / {roundValue(nutritionSummary.protein)}g</p>
          </div>
          <div className="bg-[#CEE422] p-3 rounded">
            <p className="text-[#28511D]">Жиры: {roundValue(nutritionSummary.fats_filled)}g / {roundValue(nutritionSummary.fats)}g</p>
          </div>
          <div className="bg-[#CEE422] p-3 rounded">
            <p className="text-[#28511D]">Углеводы: {roundValue(nutritionSummary.carbohydrates_filled)}g / {roundValue(nutritionSummary.carbohydrates)}g</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default NutritionDetails;
  