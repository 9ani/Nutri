import { Request, Response } from "express";
import GptService from "./gpt-service";
import { WeekPlanDocument } from "./gpt-types";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

class GptController {
  private gptService: GptService;

  constructor(gptService: GptService) {
    this.gptService = gptService;
    this.getRation = this.getRation.bind(this);
    this.saveWeekPlan = this.saveWeekPlan.bind(this);
    this.addFood = this.addFood.bind(this);
  }

  async getRation(req: Request, res: Response): Promise<void> {
    const { userJson, userString } = req.body;
    try {
      const weekPlan = await this.gptService.getRation(userJson, userString);
      if (weekPlan) {
        res.json(weekPlan);
      } else {
        res.status(500).send("Error generating ration");
      }
    } catch (error) {
      res.status(500).send("Error generating ration");
    }
  }

  async saveWeekPlan(req: Request, res: Response): Promise<void> {
    const { weekPlan } = req.body;
    if (!weekPlan) {
      res.status(400).send("No week plan provided");
      return;
    }

    if (!Array.isArray(weekPlan)) {
      res
        .status(400)
        .send("Invalid weekPlan structure: weekPlan is not an array.");
      return;
    }

    try {
      console.log(weekPlan);

      const message = await this.gptService.saveWeekPlan(
        weekPlan as unknown as WeekPlanDocument
      );
      res.status(201).send(message);
    } catch (error) {
      res.status(500).send("Error saving week plan");
    }
  }
  addMenu = async (req: Request, res: Response) => {
    const multerReq = req as MulterRequest; // Cast req to MulterRequest to access file
    const { file } = multerReq; // Destructure file from multerReq
    const { nutritionScale } = req.body; // Destructure nutritionScale from req.body
  
    // Check if nutritionScale is provided and is a valid JSON string
    if (!nutritionScale || typeof nutritionScale !== 'string') {
      res.status(400).json({ error: 'Invalid or missing nutritionScale' });
      return;
    }
  
    try {
      // Attempt to parse nutritionScale as JSON
      const parsedNutritionScale = JSON.parse(nutritionScale);
      const result = await this.gptService.addMenu(file, parsedNutritionScale);
      console.log('Result: controller', result);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in addMenu:', error);
      res.status(500).json({ error: 'Failed to process menu image.' });
    }
  };
  async addFood(req: Request, res: Response): Promise<void> {
    try {
      const multerReq = req as MulterRequest;
      const photo = multerReq.file;
      const description = multerReq.body.description;

      if (!photo) {
        res.status(400).send("No photo provided");
        return;
      }

      const analysisResult = await this.gptService.addFood(photo, description);
      res.json(analysisResult);
    } catch (error) {
      res.status(500).send("Error analyzing food");
    }
  }
}

export default GptController;
export { upload };
