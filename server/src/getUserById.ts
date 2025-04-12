// getUserById.ts
import { Request, Response } from 'express';
import { prisma } from './prisma';

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
