import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const registerUserHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { firstName, lastName, email, password, role, confirmPassword, organizationId } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword || !organizationId || !role) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        isActive: true,
        organizationId, 
      },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};
