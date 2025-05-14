import { Request, Response } from 'express';
import { prisma } from './prisma';

export const pushSubscribeHandler = async (req: Request, res: Response): Promise<void> => {
  const { endpoint, keys, userId } = req.body;

  if (!endpoint || !keys?.auth || !keys?.p256dh || !userId) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        keysAuth: keys.auth,
        keysP256dh: keys.p256dh,
        userId: Number(userId),
      },
      create: {
        endpoint,
        keysAuth: keys.auth,
        keysP256dh: keys.p256dh,
        userId: Number(userId),
      },
    });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
};
