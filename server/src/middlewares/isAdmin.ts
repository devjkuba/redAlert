import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

interface AdminRequest extends Request {
  user?: { id: number; role: string };
}

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    if (user) {
      (req as AdminRequest).user = user;
    }
    if (!user || user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      res.status(403).json({ message: 'Forbidden: Admins only' });
      return;
    }

    // Přidáme uživatele do requestu pro další použití
    (req as AdminRequest).user = user;

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};
