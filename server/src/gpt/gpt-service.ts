import axios from "axios";
import fs from "fs";
import AWS from "aws-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeekPlanDocument, UserJson, WeekPlan } from "./gpt-types";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;
const EDAMAM_API_ID = process.env.EDAMAM_API_ID;
const EDAMAM_API_KEY = process.env.EDAMAM_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

if (!bucketName) {
  console.error("AWS_BUCKET_NAME is not set in environment variables.");
  process.exit(1);
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const weekPlanSchema = new mongoose.Schema(
  {
    weekPlan: Object,
  },
  { timestamps: true }
);

const WeekPlanModel = mongoose.model("WeekPlan", weekPlanSchema);

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
}

interface GptServiceInterface {
  getRation(
    userJson: UserJson,
    userString: string
  ): Promise<WeekPlanDocument | null>;
  saveWeekPlan(weekPlan: WeekPlanDocument): Promise<WeekPlanDocument | null>;
  getWeekPlanById(id: string): Promise<WeekPlanDocument | null>;
  addFood(photo: MulterFile | undefined, description: string): Promise<any>;
  getNutrition(ingredient: string): Promise<any>;
}

class GptService implements GptServiceInterface {
  async getRation(
    userJson: UserJson,
    userString: string
  ): Promise<WeekPlanDocument | null> {
    try {
      const userPromptString = JSON.stringify({ ...userJson, userString });
      const prompt = `${systemPrompt}\n${userPromptString}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      console.log("Response from Gemini:", text);

      if (text) {
        try {
          const cleanedText = text.replace(/[^\x00-\x7F]+/g, "");
          const parsedRes = JSON.parse(cleanedText);
          console.log("Parsed Response:", parsedRes);

          if (parsedRes && Array.isArray(parsedRes.weekPlan)) {
            return parsedRes.weekPlan as WeekPlanDocument;
          } else {
            console.error(
              "Invalid weekPlan structure: weekPlan is not an array."
            );
            return null;
          }
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          return null;
        }
      } else {
        return null;
      }
    } catch (e: any) {
      console.log("Error:", e.message);
      return null;
    }
  }

  async saveWeekPlan(
    weekPlan: WeekPlanDocument
  ): Promise<WeekPlanDocument | null> {
    try {
      if (!weekPlan || !Array.isArray(weekPlan)) {
        throw new Error(
          "Invalid weekPlan structure: weekPlan is not an array."
        );
      }
      weekPlan.forEach((dayPlan: any) => {
        let calories: string | number = dayPlan.nutritionSummary.calories;

        if (typeof calories === "string" && calories.includes("-")) {
          const [lowerCalories, upperCalories] = calories
            .split("-")
            .map(Number);
          const averageCalories = (lowerCalories + upperCalories) / 2;
          dayPlan.nutritionSummary.calories = averageCalories;
        }
      });
      const newWeekPlan = new WeekPlanModel({ weekPlan: weekPlan });
      const savedWeekPlan = await newWeekPlan.save();
      console.log("Week plan saved to MongoDB");
      return await this.getWeekPlanById(savedWeekPlan._id.toString());
    } catch (error) {
      console.error("Error saving week plan:", error);
      throw new Error("Error saving week plan");
    }
  }
  async getWeekPlanById(id: string): Promise<WeekPlanDocument | null> {
    try {
      const weekPlan = await WeekPlanModel.findById(id);
      if (!weekPlan) {
        throw new Error("Week plan not found");
      }

      console.log(weekPlan.weekPlan);
      return weekPlan.weekPlan as WeekPlanDocument;
    } catch (error) {
      console.error("Error fetching week plan:", error);
      throw new Error("Error fetching week plan");
    }
  }

  async addFood(
    photo: MulterFile | undefined,
    description: string
  ): Promise<any> {
    try {
      if (!photo) {
        throw new Error("No photo provided");
      }
      const photoData = fs.readFileSync(photo.path);
      if (!bucketName) {
        throw new Error("AWS_BUCKET_NAME is not set in environment variables.");
      }

      const params = {
        Bucket: bucketName,
        Key: `${Date.now()}_${photo.originalname}`,
        Body: photoData,
        ACL: "public-read",
        ContentType: photo.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();
      const photoUrl = uploadResult.Location;
      console.log(photoUrl);

      const prompt = `By looking at Image or by ${description}, please identify the dish and list its ingredients in JSON format. DO NOT WRITE ANYTHING EXCEPT JSON. Here is the example of response format: 
            {
  "dish": "Pasta with meatballs and tomato sauce",
  "ingredients": [
    "penne pasta",
    "meatballs",
    "tomato sauce",
    "basil",
    "garlic",
    "black pepper"
  ]
}`;
      const image = {
        inlineData: {
          data: Buffer.from(fs.readFileSync(photo.path)).toString("base64"),
          mimeType: "image/jpg",
        },
      };
      const result = await model.generateContent([prompt, image]);
      const response = await result.response;
      const text = await response.text();
      console.log("Food Analysis Response:", text);

      const foodAnalysis = JSON.parse(text);
      if (!foodAnalysis || !foodAnalysis.dish) {
        throw new Error(
          "Unable to retrieve dish and ingredients from food analysis."
        );
      }
      if (foodAnalysis && foodAnalysis.dish && foodAnalysis.ingredients) {
        const dishName = foodAnalysis.dish;

        const nutritionData = await this.getNutrition(dishName);

        fs.unlinkSync(photo.path);
        const updatedWeekPlan = await this.updateNutritionToWeekPlan(nutritionData);
    console.log("Updated Week Plan:", updatedWeekPlan);

        return {
          foodAnalysis,
          nutritionData,
          updatedWeekPlan,

        };
      } else {
        console.error(
          "Unable to retrieve dish and ingredients from food analysis."
        );
        throw new Error("Unable to retrieve dish and ingredients");
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      throw new Error("Error analyzing food");
    }
  }
  private async updateNutritionToWeekPlan(nutritionData: any): Promise<any> {
    try {
      const recentWeekPlan = await WeekPlanModel.findOne().sort({ createdAt: -1 });
      console.log("Recent Week Plan:", recentWeekPlan);
      if (!recentWeekPlan) {
        throw new Error("No week plan found");
      }
  
      const today = new Date().toISOString().split('T')[0];
      console.log("Today's Date:", today);
      const dayPlan = recentWeekPlan.weekPlan.find((day: any) => {
        const planDate = new Date(day.date).toISOString().split('T')[0];
        return planDate === today;
      });
      console.log("Day Plan:", dayPlan);
  
      if (!dayPlan) {
        throw new Error("No day plan found for today");
      }
  
      const updateFields: any = {};
  
      // Function to convert nutrient values to numbers
      const convertToNumber = (value: string): number => {
        const extractedNumber = parseFloat(value.replace(/[^\d.-]/g, ''));
        return isNaN(extractedNumber) ? 0 : extractedNumber;
      };
  
      // Update fields based on nutritionData
      if (nutritionData.calories) {
        console.log(`Adding calories: ${nutritionData.calories}`);
        updateFields['weekPlan.$.nutritionSummary.calories_filled'] = dayPlan.nutritionSummary.calories_filled + Number(nutritionData.calories);
      }
  
      if (nutritionData.totalNutrients.VITA_RAE && nutritionData.totalNutrients.VITA_RAE.quantity) {
        console.log(`Adding vitamin A: ${nutritionData.totalNutrients.VITA_RAE.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.vitamins.vitaminA_filled'] = dayPlan.nutritionSummary.vitamins.vitaminA_filled + (nutritionData.totalNutrients.VITA_RAE.quantity);
      }
  
      if (nutritionData.totalNutrients.VITC && nutritionData.totalNutrients.VITC.quantity) {
        console.log(`Adding vitamin C: ${nutritionData.totalNutrients.VITC.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.vitamins.vitaminC_filled'] = dayPlan.nutritionSummary.vitamins.vitaminC_filled + (nutritionData.totalNutrients.VITC.quantity);
      }
  
      if (nutritionData.totalNutrients.VITB6A && nutritionData.totalNutrients.VITB6A.quantity) {
        console.log(`Adding vitamin B: ${nutritionData.totalNutrients.VITB6A.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.vitamins.vitaminB_filled'] = dayPlan.nutritionSummary.vitamins.vitaminB_filled + (nutritionData.totalNutrients.VITB6A.quantity);
      }
  
      if (nutritionData.totalNutrients.CA && nutritionData.totalNutrients.CA.quantity) {
        console.log(`Adding calcium: ${nutritionData.totalNutrients.CA.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.minerals.calcium_filled'] = dayPlan.nutritionSummary.minerals.calcium_filled + (nutritionData.totalNutrients.CA.quantity);
      }
  
      if (nutritionData.totalNutrients.FE && nutritionData.totalNutrients.FE.quantity) {
        console.log(`Adding iron: ${nutritionData.totalNutrients.FE.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.minerals.iron_filled'] = dayPlan.nutritionSummary.minerals.iron_filled + (nutritionData.totalNutrients.FE.quantity);
      }
  
      if (nutritionData.totalNutrients.MG && nutritionData.totalNutrients.MG.quantity) {
        console.log(`Adding magnesium: ${nutritionData.totalNutrients.MG.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.minerals.magnesium_filled'] = dayPlan.nutritionSummary.minerals.magnesium_filled + (nutritionData.totalNutrients.MG.quantity);
      }
  
      if (nutritionData.totalNutrients.PROCNT && nutritionData.totalNutrients.PROCNT.quantity) {
        console.log(`Adding protein: ${nutritionData.totalNutrients.PROCNT.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.protein_filled'] = dayPlan.nutritionSummary.protein_filled + (nutritionData.totalNutrients.PROCNT.quantity);
      }
  
      if (nutritionData.totalNutrients.CHOCDF && nutritionData.totalNutrients.CHOCDF.quantity) {
        console.log(`Adding carbohydrates: ${nutritionData.totalNutrients.CHOCDF.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.carbohydrates_filled'] = dayPlan.nutritionSummary.carbohydrates_filled + (nutritionData.totalNutrients.CHOCDF.quantity);
      }
  
      if (nutritionData.totalNutrients.FAT && nutritionData.totalNutrients.FAT.quantity) {
        console.log(`Adding fat: ${nutritionData.totalNutrients.FAT.quantity}`);
        updateFields['weekPlan.$.nutritionSummary.fats_filled'] = dayPlan.nutritionSummary.fats_filled + (nutritionData.totalNutrients.FAT.quantity);
      }
  
      const updateResult = await WeekPlanModel.findOneAndUpdate(
        { 'weekPlan._id': dayPlan._id },
        { $set: updateFields },
        { new: true }  // Return the updated document
      );
  
      if (!updateResult) {
        throw new Error("Failed to update week plan");
      }
  
      console.log("Week plan updated with nutrition data");
      return updateResult;
    } catch (error) {
      console.error("Error saving nutrition to week plan:", error);
      throw new Error("Error saving nutrition to week plan");
    }
  }
  
  
  
  
  
  
  
  async getNutrition(ingredient: string): Promise<any> {
    try {
      if (!EDAMAM_API_ID || !EDAMAM_API_KEY) {
        throw new Error("EDAMAM API credentials not provided.");
      }

      const url = "https://api.edamam.com/api/nutrition-data";
      const encodedIngredient = encodeURIComponent(ingredient);

      const params = {
        app_id: EDAMAM_API_ID,
        app_key: EDAMAM_API_KEY,
        ingr: encodedIngredient,
        "nutrition-type": "logging",
      };

      const response = await axios.get(url, { params });
      console.log(params);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching nutrition data:", error.message);
      throw new Error("Error fetching nutrition data");
    }
  }
}

const systemPrompt = `You are a professional nutritionist providing personalized nutrition plans. Based on the user's data such as age, weight, allergies, and dietary preferences, you will generate a comprehensive daily meal plan for a week. 
Provide meals that are popular in Central Asia, including countries like Russia and Kazakhstan. The plan should include all necessary vitamins and nutrients, ensuring a balanced diet.
Even if the user has specific dietary restrictions, you should provide a suitable alternative. Even if the user asks for a ration for a day,
provide a ration plan for a week starting from today's date ${new Date()
  .toISOString()
  .slice(
    0,
    10
  )}. Please return the response in the following JSON format, without any additional symbols like brackets or quotes, only in this structured JSON FORMAT without any additional strings:
{
    "weekPlan": [
        {
            "date": "YYYY-MM-DD",
            "day": "Day of the week",
            "meals": [
                {
                    "meal": "Meal type (e.g., breakfast, lunch, dinner, snack)",
                    "description": "Detailed description of the meal including ingredients and nutritional information"
                }
            ],
            "nutritionSummary": {
                "vitamins": {
                    
                    "vitaminA": "value and unit",
                    "vitaminB": "value and unit",
                    "vitaminC": "value and unit",
                    "vitaminA_filled": 0,
                    "vitaminB_filled": 0,
                    "vitaminC_filled": 0,

                },
                "minerals": {
                    "calcium": "value and unit",
                    "iron": "value and unit",
                    "magnesium": "value and unit"
                    "calcium_filled": 0,
                    "iron_filled": 0,
                    "magnesium_filled": 0,

                },
                "calories": "value",
                "protein": "value and unit",
                "carbohydrates": "value and unit",
                "fats": "value and unit"
                "calories_filled": 0,
                "protein_filled": 0,
                "carbohydrates_filled": 0,
                "fats_filled": 0,
            }
        }
    ]
}`;

export default GptService;
