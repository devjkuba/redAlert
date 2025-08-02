import { Request, Response } from 'express';
import { prisma } from './prisma';  // Připojte svůj Prisma client
import { sendWebPushToOrg } from './pushUtils';

export const messagesHandler = async (req: Request, res: Response): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const { organizationId } = req.query;
      if (!organizationId) {
        res.status(400).json({ error: 'Organization ID is required' });
        return;
      }

      try {
        const messages = await prisma.message.findMany({
          where: { organizationId: Number(organizationId) },
          include: { sender: true,  device: true, organization: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        res.status(200).json(messages);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching messages:', error.message);
        }
        res.status(500).json({ error: 'Error fetching messages' });
      }
      break;
    }

    case 'POST': {
      const { text, status, senderId, organizationId, deviceId } = req.body;
        if (!text || !organizationId || (!senderId && !deviceId)) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      try {
        const orgId = Number(organizationId);

        const message = await prisma.message.create({
          data: {
            text,
            status,
            organizationId: orgId,
            senderId: senderId ? Number(senderId) : undefined,
            deviceId: deviceId ? Number(deviceId) : undefined,
          },
        });

        await sendWebPushToOrg(
          orgId,
          `Nová zpráva`,
          JSON.stringify(text),
          `/chat`,
        );

        res.status(201).json({ message: 'Message created successfully', data: message });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error creating message:', error.message);
        }
        res.status(500).json({ error: 'Error creating message' });
      }
      break;
    }

    default:
      res.status(405).json({ error: 'Method not allowed' });
      break;
  }
};
