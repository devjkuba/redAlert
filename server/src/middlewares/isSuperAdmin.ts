import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

interface SuperAdminRequest extends Request {
  user?: { id: number; role: string };
}

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'SUPERADMIN') {
      res.status(403).json({ message: 'Forbidden: Superadmins only' });
      return;
    }

    (req as SuperAdminRequest).user = user;

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
