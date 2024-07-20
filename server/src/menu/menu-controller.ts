import { Request, Response } from 'express';
import MenuService from './menu-service';

class MenuController {
  private menuService: MenuService;

  constructor(menuService: MenuService) {
    this.menuService = menuService;
    this.recommendFood = this.recommendFood.bind(this);
  }

  async recommendFood(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, nutritionScale } = req.body;
      console.log('recommendFood:', latitude, longitude, nutritionScale);
      const recommendations = await this.menuService.recommendFood(latitude, longitude, nutritionScale);
      res.json(recommendations);
    } catch (error) {
      console.error('Error in recommendFood:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default MenuController;