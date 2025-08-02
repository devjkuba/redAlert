import { Request, Response } from 'express';
import { prisma } from './prisma';

export const devicesHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const orgId = req.query.organizationId as string;

  if (!orgId || isNaN(Number(orgId))) {
    res.status(400).json({ message: 'Missing or invalid organizationId' });
    return;
  }

  const organizationId = parseInt(orgId, 10);

  try {
    const devices = await prisma.device.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        createdAt: true,
      },
    });

    res.status(200).json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Error fetching devices' });
  }
};
