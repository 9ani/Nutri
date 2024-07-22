import mongoose from 'mongoose';
import { FoodHistoryModel } from '../../models/FoodHistory'; // Adjust the import path as needed

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const foodHistory = await FoodHistoryModel.find({ userID: userId }).sort({ dateEaten: -1 });

      res.status(200).json({ foodHistory });
    } catch (error) {
      console.error('Error fetching food history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}