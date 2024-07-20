import { Router } from 'express';
import userRouter from './user/user-router';
import gptRouter from './gpt/gpt-router';
import menuRouter from './menu/menu-router';

const globalRouter = Router();

globalRouter.use(userRouter);
globalRouter.use(gptRouter);
globalRouter.use(menuRouter);


export default globalRouter;
