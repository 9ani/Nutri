import express from 'express';
import MenuController from './menu-controller';
import MenuService from './menu-service';

const router = express.Router();
const menuService = new MenuService();
const menuController = new MenuController(menuService);

router.post('/recommend-food', menuController.recommendFood);

export default router;