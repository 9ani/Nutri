import mongoose from 'mongoose';
import { WeekPlanModel } from '../../models/WeekPlan'; // Adjust the import path as needed

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userID } = req.body;

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI);

      // Make sure NEXT_PUBLIC_BACKEND_URL is correctly set
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const response = await fetch(`${backendUrl}/api/v1/extend-week-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID })
      });

      if (response.status !== 200) {
        return res.status(response.status).json({ error: 'Failed to extend week plan' });
      }

      const extendedWeekPlan = await response.json();

      await WeekPlanModel.findOneAndUpdate(
        { userID: userID },
        { $set: { weekPlan: extendedWeekPlan } },
        { new: true, upsert: true }
      );

      res.status(200).json(extendedWeekPlan);
    } catch (error) {
      console.error('Error extending week plan:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}