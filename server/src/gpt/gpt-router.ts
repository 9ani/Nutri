import express from 'express';
import GptController from './gpt-controller';
import GptService from './gpt-service';
import multer from 'multer';

const router = express.Router();
const gptService = new GptService();
const gptController = new GptController(gptService);

const upload = multer({ dest: 'uploads/' });

router.post('/get-ration', gptController.getRation);
router.post('/save-week-plan', gptController.saveWeekPlan);
router.post('/add-food', upload.single('photo'), (req, res) => gptController.addFood(req as any, res));

export default router;
