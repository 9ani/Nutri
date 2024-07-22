import mongoose from 'mongoose';

const weekPlanSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  weekPlan: { type: Object, required: true },
}, { timestamps: true });

export const WeekPlanModel = mongoose.models.WeekPlan || mongoose.model('WeekPlan', weekPlanSchema);