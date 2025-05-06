import { Request, Response } from "express";
import { prisma } from "./prisma";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const userDeleteHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = Number(req.params.id);
  const currentUserId = Number(req.user?.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  if (!currentUserId) {
    res.status(401).json({ message: "Neautorizováno." });
    return;
  }

  try {
    if (userId === currentUserId) {
      res.status(403).json({ message: "Nemůžete smazat sami sebe." });
      return;
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      res.status(404).json({ message: "Uživatel nenalezen." });
      return;
    }

    if (userToDelete.role === "ADMIN") {
      res.status(403).json({ message: "Nelze smazat uživatele s rolí ADMIN." });
      return;
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "Uživatel úspěšně smazán." });
  } catch (error) {
    console.error("Chyba při mazání uživatele:", error);
    res.status(500).json({ message: "Chyba při mazání uživatele." });
  }
};
