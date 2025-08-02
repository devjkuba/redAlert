import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { email, phoneNumber, password } = req.body;

  if ((!email && !phoneNumber) || !password) {
    res.status(400).json({ message: 'Email nebo telefonní číslo a heslo jsou povinné' });
    return;
  }

  try {
    // Pokus najít uživatele podle emailu nebo telefonního čísla
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as { email?: string; phoneNumber?: string }[],
      },
    });

    if (user) {
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) {
        res.status(401).json({ message: 'Neplatné přihlašovací údaje' });
        return;
      }

      const token = jwt.sign(
        { userId: user.id, isDevice: false },
        process.env.JWT_SECRET as string
      );

      res.status(200).json({ message: 'Přihlášení uživatele úspěšné', token, type: 'user' });
      return;
    }

    // Pokud není user, zkus najít device podle phoneNumber
    if (phoneNumber) {
      const device = await prisma.device.findUnique({
        where: { phoneNumber },
      });

      if (!device || !bcrypt.compareSync(password, device.password)) {
        res.status(401).json({ message: 'Neplatné přihlašovací údaje zařízení' });
        return;
      }

      const token = jwt.sign(
        { deviceId: device.id, isDevice: true },
        process.env.JWT_SECRET as string
      );

      res.status(200).json({ message: 'Přihlášení zařízení úspěšné', token, type: 'device' });
      return;
    }

    res.status(401).json({ message: 'Účet nenalezen' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Interní chyba serveru' });
  }
};
