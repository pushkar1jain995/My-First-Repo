import dbConnect from '../../../lib/db';
import Task from '../../../models/Task';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await Task.find({ user: session.user.id });
        res.status(200).json(tasks);
      } catch (error) {
        res.status(400).json({ error: 'Failed to fetch tasks' });
      }
      break;

    case 'POST':
      try {
        const task = await Task.create({ ...req.body, user: session.user.id });
        res.status(201).json(task);
      } catch (error) {
        res.status(400).json({ error: 'Failed to create task' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}