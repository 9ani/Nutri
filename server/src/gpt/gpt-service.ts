import axios from "axios";
import fs from "fs";
import AWS from "aws-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  WeekPlanDocument,
  UserJson,
  WeekPlanModel,
  UserModel,
  FoodHistoryModel,
  FoodHistoryDocument,
} from "./gpt-types";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;
const EDAMAM_API_ID = process.env.EDAMAM_API_ID;
const EDAMAM_API_KEY = process.env.EDAMAM_API_KEY;
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

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
  getRation(userJson: UserJson): Promise<WeekPlanDocument | null>;
  saveWeekPlan(weekPlan: WeekPlanDocument): Promise<WeekPlanDocument | null>;
  getWeekPlanById(id: string): Promise<WeekPlanDocument | null>;
  addFood(
    photo: MulterFile | undefined,
    description: string,
    userId: string
  ): Promise<any>;
  addMenu(menuImage: MulterFile | undefined, nutritionScale: any): Promise<any>;
  getNutrition(ingredient: string): Promise<any>;
}

class GptService implements GptServiceInterface {
  async getRation(userJson: UserJson): Promise<WeekPlanDocument | null> {
    try {
      const userPromptString = JSON.stringify({ ...userJson });
      const prompt = `${systemPrompt}\n${userPromptString}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const cleanedText = text.replace(/^```json\n/, '').replace(/\n```$/, '');

      console.log("Response from Gemini:", cleanedText);

      if (text) {
        try {
          const parsedRes = JSON.parse(cleanedText);
          console.log("Parsed Response:", parsedRes);
          parsedRes.weekPlan.forEach((dayPlan: any) =>
            dayPlan.meals.forEach((meal: any) => console.log(meal))
          );
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

  async saveWeekPlan({
    weekPlan,
    userID,
  }: WeekPlanDocument): Promise<WeekPlanDocument | null> {
    try {
      if (!weekPlan || !Array.isArray(weekPlan)) {
        throw new Error(
          "Invalid weekPlan structure: weekPlan is not an array."
        );
      }

      for (const dayPlan of weekPlan) {
        let calories: string | number = dayPlan.nutritionSummary.calories;

        if (
          typeof calories === "string" &&
          (calories as string).includes("-")
        ) {
          const [lowerCalories, upperCalories] = (calories as string)
            .split("-")
            .map(Number);
          const averageCalories = (lowerCalories + upperCalories) / 2;
          dayPlan.nutritionSummary.calories = averageCalories;
        }

        // Fetch meal image URLs from Unsplash
        await Promise.all(
          dayPlan.meals.map(async (meal: any) => {
            const mealEnglishName =
              meal.description
                .match(/[a-zA-Z\s]+/g)
                ?.join(" ")
                .trim() || "default";
            console.log("mealEnglish is " + mealEnglishName);
            if (meal.img_url === "") {
              try {
                const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                  mealEnglishName
                )}&per_page=1`;
                const unsplashHeaders = {
                  Accept: "application/json",
                  Authorization: `Client-ID ${UNSPLASH_API_KEY}`, // Ensure correct authorization format
                  "User-Agent": "axios/1.7.2",
                  "Accept-Encoding": "gzip, compress, deflate, br",
                };

                const unsplashResponse = await axios.get(unsplashUrl, {
                  headers: unsplashHeaders,
                });

                const unsplashImageUrl =
                  unsplashResponse.data.results[0]?.urls.regular || "";

                meal.img_url = unsplashImageUrl; // Assign fetched image URL to meal object
              } catch (error) {
                console.error(
                  `Error fetching meal image from Unsplash for '${mealEnglishName}':`,
                  error
                );
              }
            }
          })
        );
      }

      // console.log("Before saving week plan");
      // weekPlan.forEach((dayPlan: any) =>
      //   dayPlan.meals.forEach((meal: any) => console.log(meal))
      // );

      const newWeekPlan = new WeekPlanModel({ weekPlan, userID }); // Ensure userID is included
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

  async addMenu(
    menuImage: MulterFile | undefined,
    nutritionScale: any
  ): Promise<any> {
    if (!menuImage) {
      throw new Error("No menu image uploaded.");
    }

    try {
      const imageBase64 = fs.readFileSync(menuImage.path).toString("base64");
      console.log(nutritionScale);
      const nutritionScaleString = JSON.stringify(nutritionScale);
      const prompt = `Analyze the menu from this image and compare it with the nutrition scale: ${nutritionScaleString} in grams. Recommend the most 2 necessary foods from the menu to fulfill the nutritional gaps strongly in JSON format. Here is the example of response format: 
      {
        "food": "Food name",
        "quantity": "Quantity in grams"
      }`;

      const image = {
        inlineData: {
          data: imageBase64,
          mimeType: menuImage.mimetype,
        },
      };

      const result = await model.generateContent([prompt, image]);
      const response = await result.response;
      let text = await response.text();
      console.log("Response from analysis:", text);

      // Sanitize the text to ensure it's valid JSON
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      fs.unlinkSync(menuImage.path);
      const parsedResponse = JSON.parse(text);

      return parsedResponse;
    } catch (e: any) {
      console.error("Error in addMenu:", e.message);
      throw new Error("Failed to process menu image.");
    }
  }

  async addFood(
    photo: MulterFile | undefined,
    userID: string
  ): Promise<any> {
    try {
      console.log("Adding food for userID:", userID);
      if (!photo) {
        throw new Error("No photo provided");
      }
      if (!userID) {
        throw new Error("No userID provided");
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
      console.log("Photo uploaded to:", photoUrl);
  
      const prompt = `By looking at Image , please identify the dish and list its ingredients in JSON format. DO NOT WRITE ANYTHING EXCEPT JSON. Here is the example of response format: 
            {
  "dish": "Pasta with meatballs and tomato sauce",
  "dish_in_russian": "Макароны с фрикадельками и томатным соусом",
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
  
      let foodAnalysis;
      try {
        foodAnalysis = JSON.parse(text);
      } catch (parseError) {
        console.error("Error parsing food analysis:", parseError);
        throw new Error("Failed to parse food analysis response");
      }
  
      if (!foodAnalysis || !foodAnalysis.dish) {
        throw new Error("Unable to retrieve dish from food analysis.");
      }
  
      const dishName = foodAnalysis.dish;
      console.log("Identified dish:", dishName);
  
      const nutritionData = await this.getNutrition(dishName);
      console.log("Nutrition data retrieved:", nutritionData);
  
      const foodHistory: FoodHistoryDocument = new FoodHistoryModel({
        name: foodAnalysis.dish_in_russian,
        imageUrl: photoUrl,
        dateEaten: new Date(),
        calories: nutritionData.calories || 0,
        proteins: nutritionData.totalNutrients.PROCNT?.quantity || 0,
        fats: nutritionData.totalNutrients.FAT?.quantity || 0,
        carbohydrates: nutritionData.totalNutrients.CHOCDF?.quantity || 0,
        userID: userID,
      });
  
      await foodHistory.save();
      console.log("Food history saved to database");
  
      const allUserFoodHistory = await FoodHistoryModel.find({
        userID: userID,
      }).sort({ dateEaten: -1 });
      console.log("All User Food History retrieved, count:", allUserFoodHistory.length);
  
      fs.unlinkSync(photo.path);
      console.log("Temporary photo file deleted");
  
      const updatedWeekPlan = await this.updateNutritionToWeekPlan(
        nutritionData,
        userID
      );
      console.log("Week plan updated with new nutrition data");
  
      return {
        foodAnalysis,
        nutritionData,
        updatedWeekPlan,
        allUserFoodHistory,
      };
    } catch (error) {
      console.error("Error in addFood:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to process food: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while processing food");
      }
    }
  }
  private async updateNutritionToWeekPlan(
    nutritionData: any,
    userID: string
  ): Promise<any> {
    try {
      console.log("updateNutritionToWeekPlan IDIDIDIDID", userID);
      const recentWeekPlan = await WeekPlanModel.findOne({ userID: userID });
  
      if (!recentWeekPlan) {
        throw new Error(`No week plan found for user ${userID}`);
      }
  
      console.log("Recent Week Plan:", recentWeekPlan);
  
      const today = new Date().toISOString().split("T")[0];
      console.log("Today's Date:", today);
  
      const dayPlanIndex = recentWeekPlan.weekPlan.findIndex((day: any) => {
        const planDate = day.date;
        console.log(planDate, today);
        return planDate === today;
      });
      console.log("Day Plan Index:", dayPlanIndex);
  
      if (dayPlanIndex === -1) {
        throw new Error("No day plan found for today");
      }
  
      const dayPlan = recentWeekPlan.weekPlan[dayPlanIndex];
  
      const updateFields: any = {};
  
      if (nutritionData.calories) {
        console.log(`Adding calories: ${nutritionData.calories}`);
        updateFields[`weekPlan.${dayPlanIndex}.nutritionSummary.calories_filled`] =
          dayPlan.nutritionSummary.calories_filled + Number(nutritionData.calories);
      }
  
      if (nutritionData.totalNutrients.VITA_RAE?.quantity) {
        console.log(
          `Adding vitamin A: ${nutritionData.totalNutrients.VITA_RAE.quantity}`
        );
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.vitamins.vitaminA_filled`
        ] =
          dayPlan.nutritionSummary.vitamins.vitaminA_filled +
          nutritionData.totalNutrients.VITA_RAE.quantity;
      }
  
      if (nutritionData.totalNutrients.VITC?.quantity) {
        console.log(
          `Adding vitamin C: ${nutritionData.totalNutrients.VITC.quantity}`
        );
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.vitamins.vitaminC_filled`
        ] =
          dayPlan.nutritionSummary.vitamins.vitaminC_filled +
          nutritionData.totalNutrients.VITC.quantity;
      }
  
      if (nutritionData.totalNutrients.VITB6A?.quantity) {
        console.log(
          `Adding vitamin B: ${nutritionData.totalNutrients.VITB6A.quantity}`
        );
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.vitamins.vitaminB_filled`
        ] =
          dayPlan.nutritionSummary.vitamins.vitaminB_filled +
          nutritionData.totalNutrients.VITB6A.quantity;
      }
  
      if (nutritionData.totalNutrients.CA?.quantity) {
        console.log(
          `Adding calcium: ${nutritionData.totalNutrients.CA.quantity}`
        );
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.minerals.calcium_filled`
        ] =
          dayPlan.nutritionSummary.minerals.calcium_filled +
          nutritionData.totalNutrients.CA.quantity;
      }
  
      if (nutritionData.totalNutrients.FE?.quantity) {
        console.log(`Adding iron: ${nutritionData.totalNutrients.FE.quantity}`);
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.minerals.iron_filled`
        ] =
          dayPlan.nutritionSummary.minerals.iron_filled +
          nutritionData.totalNutrients.FE.quantity;
      }
  
      if (nutritionData.totalNutrients.MG?.quantity) {
        console.log(
          `Adding magnesium: ${nutritionData.totalNutrients.MG.quantity}`
        );
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.minerals.magnesium_filled`
        ] =
          dayPlan.nutritionSummary.minerals.magnesium_filled +
          nutritionData.totalNutrients.MG.quantity;
      }
  
      if (nutritionData.totalNutrients.PROCNT?.quantity) {
        console.log(
          `Adding protein: ${nutritionData.totalNutrients.PROCNT.quantity}`
        );
        updateFields[`weekPlan.${dayPlanIndex}.nutritionSummary.protein_filled`] =
          dayPlan.nutritionSummary.protein_filled +
          nutritionData.totalNutrients.PROCNT.quantity;
      }
  
      if (nutritionData.totalNutrients.CHOCDF?.quantity) {
        console.log(
          `Adding carbohydrates: ${nutritionData.totalNutrients.CHOCDF.quantity}`
        );
        updateFields[
          `weekPlan.${dayPlanIndex}.nutritionSummary.carbohydrates_filled`
        ] =
          dayPlan.nutritionSummary.carbohydrates_filled +
          nutritionData.totalNutrients.CHOCDF.quantity;
      }
  
      if (nutritionData.totalNutrients.FAT?.quantity) {
        console.log(`Adding fat: ${nutritionData.totalNutrients.FAT.quantity}`);
        updateFields[`weekPlan.${dayPlanIndex}.nutritionSummary.fats_filled`] =
          dayPlan.nutritionSummary.fats_filled + nutritionData.totalNutrients.FAT.quantity;
      }
      console.log("Day PLANan", dayPlan);
  
      // Update the week plan in the database
      const updateResult = await WeekPlanModel.findOneAndUpdate(
        { userID: userID },
        { $set: updateFields },
        { new: true }
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
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching nutrition data:", error.message);
      throw new Error("Error fetching nutrition data");
    }
  }

  async extendWeekPlan(userID: string): Promise<WeekPlanDocument | null> {
    try {
      const existingPlan = await WeekPlanModel.findOne({ userID });
      if (!existingPlan) {
        throw new Error("No existing plan found for user");
      }
  
      const userJson = await this.getUserJsonById(userID);
      if (!userJson) {
        throw new Error("Failed to fetch user data for generating plan");
      }
  
      const newWeekPlan = await this.getRation(userJson);
      console.log("New Week Plan:", JSON.stringify(newWeekPlan));
  
      if (!newWeekPlan || !Array.isArray(newWeekPlan)) {
        throw new Error("Failed to generate a valid new week plan");
      }
  
      
  
      // Append the new week plan to the existing plan
      existingPlan.weekPlan.push(...newWeekPlan);
  
      const savedPlan = await existingPlan.save();
      console.log("Saved plan:", JSON.stringify(savedPlan));
  
      return savedPlan.weekPlan;
    } catch (error: any) {
      console.error("Error extending week plan:", error);
      throw new Error(`Error extending week plan: ${error.message}`);
    }
  }

  private async getUserJsonById(userID: string): Promise<UserJson | null> {
    try {
      const userData: any = await UserModel.findOne({ userID }).lean();
      if (!userData) return null;

      return userData;
    } catch (error) {
      console.error("Error fetching userJson:", error);
      return null;
    }
  }
}

console.log(new Date().toISOString().slice(0, 10));

const systemPrompt = `You are a professional nutritionist providing personalized nutrition plans. Based on the user's data such as age, weight, allergies, and dietary preferences, you will generate a comprehensive daily meal plan for a week. 
Provide meals that are popular in Central Asia, including countries like Russia and Kazakhstan. The plan should include all necessary vitamins and nutrients, ensuring a balanced diet. The meal must be responded in russian and emglish languages.
Even if the user has specific dietary restrictions, you should provide a suitable alternative. Even if the user asks for a ration for a day,
provide a ration plan for a week starting from today's date ${new Date()
  .toISOString()
  .slice(
    0,
    10
  )}. Please return the response in the following JSON format, without any additional symbols like brackets or quotes, only in this structured JSON FORMAT without any additional strings and "apostrophe":
{
    "weekPlan": [
        {
            "date": "YYYY-MM-DD",
            "day": "Day of the week",
            "meals": [
                {
                    "meal": "Meal type (e.g., breakfast, lunch, dinner, snack)",
                    "description": "Detailed description of the meal (very short name of meal in English) including ingredients and nutritional information",
                    "img_url": "empty string",
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
                "protein": "value in grams without string 'g', only number",
                "carbohydrates": "value in grams without string 'g'",
                "fats": "value in grams without string 'g', only number",
                "calories_filled": 0,
                "protein_filled": 0,
                "carbohydrates_filled": 0,
                "fats_filled": 0,
            }
        }
    ]
}`;

export default GptService;
