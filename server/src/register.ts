// server/register.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method === 'POST') {
    const { firstName, lastName, organization, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        organization,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created', user });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
