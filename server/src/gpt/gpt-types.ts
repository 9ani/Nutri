import mongoose, { Schema, Document, Types } from 'mongoose';

// Define interfaces for Meal, NutritionSummary, DayPlan, and WeekPlanDocument
interface Meal {
  meal: string;
  description: string;
}

interface NutritionSummary {
  vitamins: string[];
  nutrients: string[];
  calories: number;
}

interface DayPlan {
  date: string;
  day: string;
  meals: Meal[];
  nutritionSummary: NutritionSummary;
}

export interface WeekPlanDocument extends Document {
  weekPlan: DayPlan[];
}

export interface UserJson {
  age: number;
  weight: number;
  height: number;
  allergies: string[];
  dietaryPreferences: string[];
  goals: string;
}

// Define Mongoose schemas
const mealSchema = new Schema<Meal>({
  meal: { type: String, required: true },
  description: { type: String, required: true },
});

const nutritionSummarySchema = new Schema<NutritionSummary>({
  vitamins: { type: [String], required: true },
  nutrients: { type: [String], required: true },
  calories: { type: Number, required: true },
});

const dayPlanSchema = new Schema<DayPlan>({
  date: { type: String, required: true },
  day: { type: String, required: true },
  meals: { type: [mealSchema], required: true },
  nutritionSummary: { type: nutritionSummarySchema, required: true },
});

const weekPlanSchema = new Schema<WeekPlanDocument>({
  weekPlan: { type: [dayPlanSchema], required: true },
});

// Create and export the model
export const WeekPlan = mongoose.model<WeekPlanDocument>('WeekPlan', weekPlanSchema);
