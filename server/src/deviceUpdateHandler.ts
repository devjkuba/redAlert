import { Request, Response } from 'express';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const deviceUpdateHandler = async (req: Request, res: Response): Promise<void> => {
  const deviceId = Number(req.params.id);

  if (isNaN(deviceId)) {
    res.status(400).json({ message: 'Invalid device ID' });
    return;
  }

  const { name, phone, password } = req.body;

  if (!name || !phone) {
    res.status(400).json({ message: 'Name and phone are required' });
    return;
  }

  try {
    interface DeviceUpdateData {
      name: string;
      phone: string;
      password?: string;
    }

    const dataToUpdate: DeviceUpdateData = {
      name,
      phone,
    };

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: dataToUpdate,
    });

    res.status(200).json(updatedDevice);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ message: 'Error updating device' });
  }
};
