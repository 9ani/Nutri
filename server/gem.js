import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  const prompt = "Given this photo, what are the ingredients of the food shown in the photo? Also show approximate size of foods in metric units.";
  const image = {
    inlineData: {
      data: Buffer.from(fs.readFileSync("soup.jfif")).toString("base64"),
      mimeType: "image/jfif",
    },
  };

  const result = await model.generateContent([prompt, image]);
  const response = await result.response;
  const text = await response.text(); // Ensure you await the text() if it's a promise
  console.log(text);
}

run();

