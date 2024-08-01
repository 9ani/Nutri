import { Request, Response } from "express";
import GptService from "./gpt-service";
import { WeekPlanDocument } from "./gpt-types";
import multer from "multer";

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/heic',
      'image/heif'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, WEBP, HEIC, and HEIF are allowed.'));
    }
  }
});

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
    this.addMenu = this.addMenu.bind(this);
    this.extendWeekPlan = this.extendWeekPlan.bind(this);
  }

  async getRation(req: Request, res: Response): Promise<void> {
    const { userJson } = req.body;
    try {
      const weekPlan = await this.gptService.getRation(userJson);
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
    const { weekPlan, userID } = req.body;
    console.log("userID", userID);

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

    if (!userID) {
      res.status(400).send("No userID provided");
      return;
    }

    try {
      const weekPlanDocument: WeekPlanDocument = {
        weekPlan,
        userID,
      } as WeekPlanDocument;
      const savedWeekPlan = await this.gptService.saveWeekPlan(
        weekPlanDocument
      );
      res.status(201).send(savedWeekPlan);
    } catch (error) {
      console.error("Error saving week plan:", error);
      res.status(500).send("Error saving week plan");
    }
  }

  async addFood(req: Request, res: Response): Promise<void> {
    try {
      const multerReq = req as MulterRequest;
      const photo = multerReq.file;
      const userID = multerReq.body.userID;

      if (!photo) {
        res.status(400).send("No photo provided");
        return;
      }

      const analysisResult = await this.gptService.addFood(
        photo,
        userID
      );
      res.json(analysisResult);
    } catch (error) {
      res.status(500).send("Error analyzing food");
    }
  }

  async addMenu(req: Request, res: Response): Promise<void> {
    const multerReq = req as MulterRequest;
    const { file } = multerReq;
    const { nutritionScale } = req.body;

    if (!nutritionScale || typeof nutritionScale !== "string") {
      res.status(400).json({ error: "Invalid or missing nutritionScale" });
      return;
    }

    try {
      const parsedNutritionScale = JSON.parse(nutritionScale);
      const result = await this.gptService.addMenu(file, parsedNutritionScale);
      console.log("Result: controller", result);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in addMenu:", error);
      res.status(500).json({ error: "Failed to process menu image." });
    }
  }

  async extendWeekPlan(req: Request, res: Response): Promise<void> {
    const { userID } = req.body;
    if (!userID) {
      res.status(400).send("No userID provided");
      return;
    }

    try {
      const extendedWeekPlan = await this.gptService.extendWeekPlan(userID);
      res.status(200).send(extendedWeekPlan);
    } catch (error) {
      console.error("Error extending week plan:", error);
      res.status(500).send("Error extending week plan");
    }
  }
}

export default GptController;
export { upload };