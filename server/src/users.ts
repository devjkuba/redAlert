import { Request, Response } from 'express';
import { prisma } from './prisma';

export const usersHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const orgId = req.query.organizationId as string;

  if (!orgId || isNaN(Number(orgId))) {
    res.status(400).json({ message: 'Missing or invalid organizationId' });
    return;
  }

  const organizationId = parseInt(orgId);

  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        role: true,
        isActive: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};
