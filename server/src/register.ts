import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { sendEmail } from './mailer';

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

    if (!name || !street || !postalCode || !location) {
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

    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name,
        city,
        country,
      },
    });

    if (existingOrganization) {
      res.status(400).json({ message: 'Organization already exists' });
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
          gpsLat: parseFloat(gps?.lat?.toString() ?? '0'),
          gpsLng: parseFloat(gps?.lng?.toString() ?? '0'),
        },
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ message: 'Error creating organization' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultServices = [
      { label: 'Policie ČR', number: '158', icon: 'Shield', hasSms: true },
      { label: 'Městská policie', number: '156', icon: 'Shield', hasSms: true },
      { label: 'Zdravotnická záchranná služba', number: '155', icon: 'Ambulance', hasSms: false },
      { label: 'Tísňová linka', number: '112', icon: 'PhoneCall', hasSms: true },
      { label: 'Hasičský záchranný sbor ČR', number: '150', icon: 'Flame', hasSms: true },
    ];
    await prisma.emergencyService.createMany({
      data: defaultServices.map(s => ({ ...s, organizationId: newOrganization.id })),
    });

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

      await sendEmail({
        to: email,
        subject: 'Registrace byla úspěšná',
        text: `Dobrý den ${firstName} ${lastName},\n\nbyl jste úspěšně zaregistrován jako administrátor organizace ${newOrganization.name} v aplikaci https://redalert.cz.\n\nDěkujeme,\nTým CyberDev.cz`,
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