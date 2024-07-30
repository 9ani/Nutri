import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  userID: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  gender: { type: String, required: true },
  allergies: { type: [String], default: [] },
  dietaryPreferences: { type: [String], default: [] },
  goals: { type: String, default: "" },
  physicalActivity: { type: String, default: "" },
  goalCompletionTime: { type: String, default: "" },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);