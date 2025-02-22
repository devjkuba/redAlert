import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method === 'POST') {
    const { firstName, lastName, email, password, confirmPassword, phone, organizationData } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone || !organizationData) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const { name, street, postalCode, location, gps } = organizationData;

    if (!name || !street || !postalCode || !location || !gps?.lat || !gps?.lng) {
      res.status(400).json({ message: 'Missing organization fields' });
      return;
    }

    const [country, city] = location;
    if (!country || !city) {
      res.status(400).json({ message: 'Missing location details (country and city)' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    let newOrganization;
    try {
      newOrganization = await prisma.organization.create({
        data: {
          name,
          street,
          postalCode,
          city,
          country,
          gpsLat: parseFloat(gps.lat.toString()),
          gpsLng: parseFloat(gps.lng.toString()),
        },
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ message: 'Error creating organization' });
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
          organizationId: newOrganization.id,
          role: 'ADMIN',
          isActive: true,
        },
      });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);

      res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};