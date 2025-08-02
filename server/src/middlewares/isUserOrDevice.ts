import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
  device?: { id: number; organizationId: number };
}

export const isUserOrDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId?: number; deviceId?: number };

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });

      if (!user) {
        res.status(401).json({ message: 'Unauthorized: User not found' });
        return;
      }

      (req as AuthenticatedRequest).user = user;
      next();
      return;
    }

    if (decoded.deviceId) {
      const device = await prisma.device.findUnique({
        where: { id: decoded.deviceId },
        select: { id: true, organizationId: true },
      });

      if (!device) {
        res.status(401).json({ message: 'Unauthorized: Device not found' });
        return;
      }

      (req as AuthenticatedRequest).device = device;
      next();
      return;
    }

    res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
