import dbConnect from '../../../lib/db';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await dbConnect();

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = await User.create({ name, email, password });
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}