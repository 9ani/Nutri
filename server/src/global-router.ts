import { Router } from 'express';
import userRouter from './user/user-router';
import gptRouter from './gpt/gpt-router';

const globalRouter = Router();

globalRouter.use(userRouter);
globalRouter.use(gptRouter);


export default globalRouter;
