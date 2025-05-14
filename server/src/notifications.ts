import { Request, Response } from 'express';
import { prisma } from './prisma';
import webpush from 'web-push';
import { sendEmail } from './mailer';

const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY ?? '',
  privateKey: process.env.PRIVATE_KEY ?? '',
};

webpush.setVapidDetails(
  'mailto:redalert@cyberdev.cz',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const notificationshandler = async (req: Request, res: Response): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { orgId } = req.query;
      if (!orgId) {
        res.status(400).json({ error: 'Missing organization ID' });
        return;
      }

      try {
        const notifications = await prisma.notification.findMany({
          where: { organizationId: Number(orgId) },
          include: { triggeredBy: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        res.status(200).json(notifications);
      } catch {
        res.status(500).json({ error: 'Error fetching notifications' });
      }
      break;
    }

    case 'POST': {
      const { type, message, triggeredById, organizationId, status } = req.body;
      if (!type || !message || !triggeredById || !organizationId || !status) {
        res.status(400).json({ error: 'Missing fields' });
        return;
      }

      try {
        const organization = await prisma.organization.findUnique({
          where: { id: Number(organizationId) },
          select: { name: true },
        });

        await prisma.notification.create({
          data: {
            type,
            message,
            status,
            triggeredById: Number(triggeredById),
            organizationId: Number(organizationId),
          },
        });
        await prisma.message.create({
          data: {
            text: message,
            type: 'ALARM',
            status,
            senderId: Number(triggeredById),
            organizationId: Number(organizationId),
          },
        });

        const sender = await prisma.user.findUnique({
          where: { id: Number(triggeredById) },
          select: { firstName: true, lastName: true },
        });

        const users = await prisma.user.findMany({
          where: {
            organizationId: Number(organizationId),
            isActive: true,
            email: {
              not: undefined,
            },
          },
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        const emailPromises = users.map((user) => {
          if (!user.email) return Promise.resolve();

          return sendEmail({
            to: user.email,
            subject: `Nová notifikace: ${type}`,
            text: message + '\nOdesílatel: ' + 
                  (sender ? sender.firstName + ' ' + sender.lastName : '') + 
                  '\nOrganizace: ' + (organization?.name ?? ''),
          });
        });

        await Promise.all(emailPromises);

        const subscriptions = await prisma.pushSubscription.findMany({
          where: {
            user: {
              organizationId: Number(organizationId),
              isActive: true,
            },
          },
        });
        
        const payload = JSON.stringify({
          title: `Notifikace: ${type}`,
          body: message,
        });
        
        const pushPromises = subscriptions.map((sub) =>
          webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              auth: sub.keysAuth,
              p256dh: sub.keysP256dh,
            },
          }, payload).catch(err => {
            console.error('Push error:', err);
          })
        );
        
        await Promise.all(pushPromises);

        res.status(201).json({ message: 'Notification created successfully' });
      } catch {
        res.status(500).json({ error: 'Error creating notification' });
      }
      break;
    }

    default:
      res.status(405).json({ error: 'Method not allowed' });
      break;
  }
};