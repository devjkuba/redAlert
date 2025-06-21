import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { prisma } from './prisma';
import { sendWebPushToOrg } from './pushUtils';
import { MessageType } from '@prisma/client';

const upload = multer({
  storage: multer.memoryStorage(), // ukládá do paměti, ne na disk
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Nepovolený typ souboru'));
    } else {
      cb(null, true);
    }
  },
});

export const uploadImageHandler = [
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const { senderId, organizationId, text } = req.body;

      if (!req.file || !senderId || !organizationId) {
        return res.status(400).json({ error: 'Missing required fields or file' });
      }

      const orgId = Number(organizationId);
      const sId = Number(senderId);

      const fileName = `message_${Date.now()}.webp`;
      const filePath = path.join(__dirname, '../../public/uploads', fileName);
      const imageUrl = `/uploads/${fileName}`;

      // Optimalizace a uložení
      await sharp(req.file.buffer)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);

      // Uložení zprávy do DB
      const message = await prisma.message.create({
        data: {
          senderId: sId,
          organizationId: orgId,
          type: MessageType.IMAGE,
          imageUrl,
          text: text || '',
        },
        include: {
          sender: true,
        },
      });

      await sendWebPushToOrg(
        orgId,
        'Nová fotografie',
        'Uživatel odeslal obrázek',
        '/chat',
      );

      res.status(201).json(message);
    } catch (err) {
      console.error('Chyba při nahrávání obrázku:', err);
      res.status(500).json({ error: 'Chyba při nahrávání obrázku' });
    }
  },
];
