import { Router } from "express";
import GptService from "./gpt-service";
import GptController from "./gpt-controller";

const gptRouter = Router();
const gptService = new GptService();
const gptController = new GptController(gptService);

gptRouter.post("/ration", gptController.getRation);
gptRouter.post("/saveWeekPlan", gptController.saveWeekPlan);

export default gptRouter;
