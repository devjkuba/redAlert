import { Request, Response } from 'express';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

interface UserUpdateData {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password?: string;
}

export const userUpdateHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  const { firstName, lastName, password, email, role } = req.body;

  if (!firstName || !lastName || !email || !role) {
    res.status(400).json({ message: 'First name, last name, role and email are required' });
    return;
  }

  const allowedRoles: Role[] = ['ADMIN', 'USER'];
  if (!allowedRoles.includes(role)) {
    res.status(400).json({ message: 'Role must be either ADMIN or USER' });
    return;
  }

  try {
    const dataToUpdate: UserUpdateData = {
      firstName,
      lastName,
      email,
      role,
    };

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
      }
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
