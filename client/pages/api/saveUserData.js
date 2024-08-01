import mongoose from 'mongoose';
import { UserModel } from '../../models/User'; // Adjust the import path as needed

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userJson, userID } = req.body;

    // Logging received data
    // console.log('Received userJson:', JSON.stringify(userJson, null, 2));
    // console.log('Received userID:', userID);

    if (!userID || !userJson) {
      console.error('Missing userID or userJson');
      return res.status(400).json({ error: 'User ID and user data are required' });
    }

    try {
      // Log MongoDB connection attempt
      // console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      // console.log('Connected to MongoDB');

      // Check if the user already exists
      // console.log('Checking if user exists...');
      const existingUser = await UserModel.findOne({ userID });
      // console.log('Existing user:', existingUser);

      if (existingUser) {
        // console.log('User already exists, updating user data...');
        await UserModel.updateOne({ userID }, userJson);
        // console.log('User data updated successfully');
      } else {
        // console.log('Creating a new user...');
        const newUser = new UserModel({
          userID,
          ...userJson
        });
        await newUser.save();
        // console.log('New user created successfully');
      }

      res.status(200).json({ message: 'User data saved successfully' });
    } catch (error) {
      console.error('Error saving user data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    console.error(`Method ${req.method} Not Allowed`);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}