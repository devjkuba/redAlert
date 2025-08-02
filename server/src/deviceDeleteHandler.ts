import { Request, Response } from 'express';
import { prisma } from './prisma';

export const deviceDeleteHandler = async (req: Request, res: Response): Promise<void> => {
  const deviceId = Number(req.params.id);

  if (isNaN(deviceId)) {
    res.status(400).json({ message: 'Invalid device ID' });
    return;
  }

  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }

    await prisma.device.delete({
      where: { id: deviceId },
    });

    res.status(200).json({ message: 'Device successfully deleted.' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Error deleting device.' });
  }
};
