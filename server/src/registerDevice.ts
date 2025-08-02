import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export const registerDeviceHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token not provided' });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  const { name, phoneNumber, password, confirmPassword, organizationId } = req.body;

  if (!name || !phoneNumber || !password || !confirmPassword || !organizationId) {
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match' });
    return;
  }

  const existingDevice = await prisma.device.findUnique({ where: { phoneNumber } });
  if (existingDevice) {
    res.status(400).json({ message: 'Device with this phone number already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const device = await prisma.device.create({
      data: {
        name,
        phoneNumber,
        password: hashedPassword,
        organizationId,
      },
    });

    res.status(201).json({ message: 'Device registered successfully', deviceId: device.id });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ message: 'Error registering device' });
  }
};
