import mongoose, { Schema, Document } from 'mongoose';
import { Request } from 'express';
import { Readable } from 'stream';

// Define interface for Multer file handling
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  stream: Readable; 
}

// Define interface for user data
export interface UserJson {
  age: number;
  weight: number;
  height: number;
  allergies?: string[];
  dietaryPreferences?: string[];
  goals?: string;
  physicalActivity?: string;
  goalCompletionTime?: string;
}

// Define interface for meal components in the day plan
interface Meal {
  meal: string;
  description: string;
  img_url: string;
}

// Define interface for vitamins within the nutrition summary
interface Vitamins {
  vitaminA: string;
  vitaminB: string;
  vitaminC: string;
  vitaminA_filled: number;
  vitaminB_filled: number;
  vitaminC_filled: number;
}

// Define interface for minerals within the nutrition summary
interface Minerals {
  calcium: string;
  iron: string;
  magnesium: string;
  calcium_filled: number;
  iron_filled: number;
  magnesium_filled: number;
}

// Define interface for nutrition summary
interface NutritionSummary {
  vitamins: Vitamins;
  minerals: Minerals;
  calories: string | number;
  protein: number;
  carbohydrates: number;
  fats: number;
  calories_filled: number;
  protein_filled: number;
  carbohydrates_filled: number;
  fats_filled: number;
}

// Define interface for a single day plan
interface DayPlan {
  date: string;
  day: string;
  meals: Meal[];
  nutritionSummary: NutritionSummary;
}

// Define mongoose document interface for Week Plan
export interface WeekPlanDocument extends Document {
  weekPlan: DayPlan[];
  userID: string;
}

// Define mongoose document interface for User
export interface UserDocument extends Document, UserJson {
  userID: string;
}

// Define mongoose document interface for Food History
export interface FoodHistoryDocument extends Document {
  name: string;
  imageUrl: string;
  dateEaten: Date;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  userID: string;
}

// Define schema for vitamins within the nutrition summary
const vitaminsSchema = new Schema({
  vitaminA: { type: String, required: true },
  vitaminB: { type: String, required: true },
  vitaminC: { type: String, required: true },
  vitaminA_filled: { type: Number, required: true },
  vitaminB_filled: { type: Number, required: true },
  vitaminC_filled: { type: Number, required: true },
});

// Define schema for minerals within the nutrition summary
const mineralsSchema = new Schema({
  calcium: { type: String, required: true },
  iron: { type: String, required: true },
  magnesium: { type: String, required: true },
  calcium_filled: { type: Number, required: true },
  iron_filled: { type: Number, required: true },
  magnesium_filled: { type: Number, required: true },
});

// Define schema for the nutrition summary
const nutritionSummarySchema = new Schema({
  vitamins: { type: vitaminsSchema, required: true },
  minerals: { type: mineralsSchema, required: true },
  calories: { type: Schema.Types.Mixed, required: true }, // This can be string or number
  protein: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
  fats: { type: Number, required: true },
  calories_filled: { type: Number, required: true },
  protein_filled: { type: Number, required: true },
  carbohydrates_filled: { type: Number, required: true },
  fats_filled: { type: Number, required: true },
});

// Define schema for a meal in the day plan
const mealSchema = new Schema({
  meal: { type: String, required: true },
  description: { type: String, required: true },
  img_url: { type: String, default: "" },
});

// Define schema for a single day plan
const dayPlanSchema = new Schema({
  date: { type: String, required: true },
  day: { type: String, required: true },
  meals: { type: [mealSchema], required: true },
  nutritionSummary: { type: nutritionSummarySchema, required: true },
});

// Define schema for Food History
const FoodHistorySchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  dateEaten: { type: Date, required: true },
  calories: { type: Number, required: true },
  proteins: { type: Number, required: true },
  fats: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
  userID: { type: String, required: true },
});

// Define schema for Week Plan
const weekPlanSchema = new Schema({
  weekPlan: { type: [dayPlanSchema], required: true },
  userID: { type: String, required: true },
});

// Define schema for User
const userSchema = new Schema({
  userID: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  allergies: { type: [String], default: [] },
  dietaryPreferences: { type: [String], default: [] },
  goals: { type: String, default: "" },
  physicalActivity: { type: String, default: "" },
  goalCompletionTime: { type: String, default: "" }
}, { timestamps: true });

// Avoid OverwriteModelError by checking if the model already exists
export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
export const WeekPlanModel = mongoose.models.WeekPlan || mongoose.model<WeekPlanDocument>('WeekPlan', weekPlanSchema);
export const FoodHistoryModel = mongoose.models.FoodHistory || mongoose.model<FoodHistoryDocument>('FoodHistory', FoodHistorySchema);

// Extend the Express Request interface to include Multer file handling
export interface MulterRequest extends Request {
  file: MulterFile;
}