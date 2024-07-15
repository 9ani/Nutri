import mongoose, { Schema, Document } from 'mongoose';
import { Request } from 'express';
import { Readable } from 'stream';

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

interface Meal {
  meal: string;
  description: string;
  img_url: string;
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

const mealSchema = new Schema({
  meal: { type: String, required: true },
  description: { type: String, required: true },
});

const nutritionSummarySchema = new Schema({
  vitamins: { type: [String], required: true },
  nutrients: { type: [String], required: true },
  calories: { type: Number, required: true },
});

const dayPlanSchema = new Schema({
  date: { type: String, required: true },
  day: { type: String, required: true },
  meals: { type: [mealSchema], required: true },
  nutritionSummary: { type: nutritionSummarySchema, required: true },
});

const weekPlanSchema = new Schema({
  weekPlan: { type: [dayPlanSchema], required: true },
});

export const WeekPlan = mongoose.model<WeekPlanDocument>('WeekPlan', weekPlanSchema);

export interface UserJson {
  age: number;
  weight: number;
  height: number;
  allergies?: string[];
  dietaryPreferences?: string[];
  goals?: string;
}

export interface MulterRequest extends Request {
  file: MulterFile;
}
