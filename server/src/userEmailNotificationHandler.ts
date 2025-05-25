import { Request, Response } from 'express';
import { prisma } from './prisma';

export const userEmailNotificationHandler = async (req: Request, res: Response): Promise<void> => {
  const { userId, enabled } = req.body;

  if (typeof userId !== 'number' || typeof enabled !== 'boolean') {
    res.status(400).json({ error: 'Missing or invalid fields' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotificationsEnabled: enabled,
      },
    });

    res.status(200).json({ message: 'Email notification preference updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user preference' });
  }
};