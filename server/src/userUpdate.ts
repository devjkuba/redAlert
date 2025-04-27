import { Request, Response } from 'express';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const userUpdateHandler = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  const { firstName, lastName, password } = req.body;

  if (!firstName || !lastName) {
    res.status(400).json({ message: 'First name and last name are required' });
    return;
  }

  try {
    const dataToUpdate = {
      firstName,
      lastName,
      password,
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};
