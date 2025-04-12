import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma'; // nebo cesta k vašemu Prisma klientovi

export const userHandler = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1]; // Extrahování tokenu z Authorization headeru

  if (!token) {
    res.status(401).json({ message: 'Token not provided' });
    return;
  }

  try {
    // Verifikace tokenu
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // Získání uživatele z databáze na základě userId obsaženého v tokenu
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, firstName: true, role: true, organizationId: true, lastName: true, email: true }, // Zvolte, jaké informace chcete vrátit
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Odeslání informací o uživateli
    res.status(200).json(user);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
