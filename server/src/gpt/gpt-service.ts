import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeekPlan, WeekPlanDocument, UserJson } from "./gpt-types";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface GptServiceInterface {
  getRation(userJson: UserJson, userString: string): Promise<WeekPlanDocument | null>;
  saveWeekPlan(weekPlan: WeekPlanDocument): Promise<string>;
}

class GptService implements GptServiceInterface {
  async getRation(userJson: UserJson, userString: string): Promise<WeekPlanDocument | null> {
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
            console.error("Invalid weekPlan structure: weekPlan is not an array.");
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

  async saveWeekPlan(weekPlan: WeekPlanDocument): Promise<string> {
    try {
      // Validate weekPlan structure
      if (!weekPlan || !Array.isArray(weekPlan)) {
        throw new Error("Invalid weekPlan structure: weekPlan is not an array.");
      }

      weekPlan.forEach((dayPlan: any) => {
        let calories: string | number = dayPlan.nutritionSummary.calories;

        if (typeof calories === "string" && calories.includes("-")) {
          const [lowerCalories, upperCalories] = calories.split("-").map(Number);
          const averageCalories = (lowerCalories + upperCalories) / 2;
          dayPlan.nutritionSummary.calories = averageCalories;
        }
      });

      const newWeekPlan = new WeekPlan({ weekPlan: weekPlan });
      await newWeekPlan.save();
      console.log("Week plan saved to MongoDB");
      return "Week plan saved successfully";
    } catch (error) {
      console.error("Error saving week plan:", error);
      throw new Error("Error saving week plan");
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
  )}. Please return the response in the following JSON format, without any additional symbols like ${``} brackets or quotes, only in JSON FORMAT:
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
        "vitamins": "List of vitamins",
        "nutrients": "List of key nutrients",
        "calories": "Total calorie count"
      }
    }
  ]
}
  Write calories only in number format, do not add any strings like "approximately".
If the user prompt is irrelevant, return an empty weekPlan array.`;

export default GptService;
