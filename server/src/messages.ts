import { Request, Response } from 'express';
import { prisma } from './prisma';  // Připojte svůj Prisma client

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
          include: { sender: true, organization: true },
          orderBy: { createdAt: 'desc' },
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
      const { text, senderId, organizationId } = req.body;
      if (!text || !senderId || !organizationId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      try {
        const message = await prisma.message.create({
          data: {
            text,
            senderId: Number(senderId),
            organizationId: Number(organizationId),
          },
        });
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
