import mongoose from 'mongoose';
import { WeekPlanModel } from '../../models/WeekPlan'; // Adjust the import path as needed

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const weekPlan = await WeekPlanModel.findOne({ userID: userId }).sort({ createdAt: -1 });

      if (weekPlan) {
        res.status(200).json({ weekPlan: weekPlan.weekPlan });
      } else {
        res.status(404).json({ error: 'Week plan not found for this user' });
      }
    } catch (error) {
      console.error('Error fetching week plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}