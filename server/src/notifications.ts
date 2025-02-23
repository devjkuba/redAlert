import { Request, Response } from 'express';
import { prisma } from './prisma';

export const notificationshandler = async (req: Request, res: Response): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { orgId } = req.query;
      if (!orgId) {
        res.status(400).json({ error: 'Missing organization ID' });
        return;
      }

      try {
        const notifications = await prisma.notification.findMany({
          where: { organizationId: Number(orgId) },
          include: { triggeredBy: true },
          orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(notifications);
      } catch {
        res.status(500).json({ error: 'Error fetching notifications' });
      }
      break;

    case 'POST':
      const { type, message, triggeredById, organizationId } = req.body;
      if (!type || !message || !triggeredById || !organizationId) {
        res.status(400).json({ error: 'Missing fields' });
        return;
      }

      try {
        await prisma.notification.create({
          data: {
            type,
            message,
            triggeredById: Number(triggeredById),
            organizationId: Number(organizationId),
          },
        });
        res.status(201).json({ message: 'Notification created successfully' });
      } catch {
        res.status(500).json({ error: 'Error creating notification' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
      break;
  }
};