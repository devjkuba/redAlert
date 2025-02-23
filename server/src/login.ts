// server/login.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
