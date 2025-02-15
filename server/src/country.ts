// server/country.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const countryHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method === 'GET') {
    try {
      const country = await prisma.country.findMany();
      res.status(200).json(country);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
