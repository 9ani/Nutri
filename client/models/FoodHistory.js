import mongoose from 'mongoose';

const foodHistorySchema = new mongoose.Schema({
  userID: { type: String, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  dateEaten: { type: Date, required: true },
  calories: { type: Number, required: true },
  proteins: { type: Number, required: true },
  fats: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
}, { timestamps: true });

export const FoodHistoryModel = mongoose.models.FoodHistory || mongoose.model('FoodHistory', foodHistorySchema);