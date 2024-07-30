import express from 'express';
import GptController from './gpt-controller';
import GptService from './gpt-service';
import multer from 'multer';

const router = express.Router();
const gptService = new GptService();
const gptController = new GptController(gptService);

const upload = multer({ dest: 'uploads/' });

router.post('/ration', gptController.getRation);
router.post('/saveWeekPlan', gptController.saveWeekPlan);
router.post('/add-food', upload.single('photo'), (req, res) => gptController.addFood(req as any, res));
router.post('/add-menu', upload.single('menuImage'), (req, res) => gptController.addMenu(req as any, res));
router.post('/extend-week-plan', gptController.extendWeekPlan);

export default router;