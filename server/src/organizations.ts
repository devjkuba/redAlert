import express from 'express';
import { prisma } from './prisma';

export const organizationsHandler = async (req: express.Request, res: express.Response): Promise<void> => {
  if (req.method === 'POST') {
    const { name, gps, postalCode, street, city, country } = req.body;

    if (!name || !postalCode || !street || !city || !country) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    try {
      // Add the new organization to the database
      const newOrganization = await prisma.organization.create({
        data: {
          name,
          gpsLat: parseFloat(gps?.lat ?? 0),
          gpsLng: parseFloat(gps?.lng ?? 0 ),
          postalCode,
          street,
          city,
          country,
        },
      });

      res.status(201).json({ message: 'Organization added successfully!', organization: newOrganization });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch all organizations from the database
      const organizations = await prisma.organization.findMany();
      res.status(200).json(organizations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
