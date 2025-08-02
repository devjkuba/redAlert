import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

interface JwtPayload {
  userId?: number;
  deviceId?: number;
  isDevice?: boolean;
}

export const userHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token not provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          emailNotificationsEnabled: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              country: true,
              subscriptionPaid: true,
              subscriptionValidUntil: true,
              city: true,
              street: true,
              postalCode: true,
              gpsLat: true,
              gpsLng: true,
              activeUntil: true,
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ ...user, isDevice: false });
      return;
    }

    if (decoded.deviceId) {
      const device = await prisma.device.findUnique({
        where: { id: decoded.deviceId },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              country: true,
              subscriptionPaid: true,
              subscriptionValidUntil: true,
              city: true,
              street: true,
              postalCode: true,
              gpsLat: true,
              gpsLng: true,
              activeUntil: true,
            },
          },
        },
      });

      if (!device) {
        res.status(404).json({ message: 'Device not found' });
        return;
      }

      res.status(200).json({ ...device, isDevice: true });
      return;
    }

    res.status(400).json({ message: 'Invalid token payload' });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
