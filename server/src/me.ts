import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

interface JwtPayload {
  userId?: number;
  deviceId?: number;
  isDevice?: boolean;
}

export const meHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.token; // pokud používáš cookie-parser
    if (!token) {
      res.status(401).json({ message: "Token not provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          organizationId: true,
          organization: {
            select: { id: true, name: true }
          }
        },
      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json({ ...user, isDevice: false });
      return;
    }

    if (decoded.deviceId) {
      const device = await prisma.device.findUnique({
        where: { id: decoded.deviceId },
        select: { id: true, name: true, organizationId: true }
      });
      if (!device) {
        res.status(404).json({ message: "Device not found" });
        return;
      }
      res.status(200).json({ ...device, isDevice: true });
      return;
    }

    res.status(400).json({ message: "Invalid token payload" });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
