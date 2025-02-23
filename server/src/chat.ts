import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from './prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const { orgId } = req.query;
      if (!orgId) return res.status(400).json({ error: 'Missing organization ID' });
      const messages = await prisma.message.findMany({
        where: { organizationId: Number(orgId) },
        include: { sender: true },
        orderBy: { createdAt: 'asc' }
      });
      return res.status(200).json(messages);

    case 'POST':
      const { text, senderId, organizationId } = req.body;
      if (!text || !senderId || !organizationId) return res.status(400).json({ error: 'Missing fields' });

      const message = await prisma.message.create({
        data: {
          text,
          senderId,
          organizationId
        }
      });
      return res.status(201).json(message);

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
