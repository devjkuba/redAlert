// src/services/emergencyServiceHandler.ts
import { Request, Response } from "express";
import { prisma } from "./prisma";
import { io } from "./server";

export const emergencyServiceHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { method } = req;
  const orgId = Number(req.query.organizationId);

  try {
    switch (method) {
      case "GET": {
        // GET /api/emergency-services?organizationId=123
        const services = await prisma.emergencyService.findMany({
          where: { organizationId: orgId },
          orderBy: { order: "asc" },
        });
        res.status(200).json(services);
        return;
      }

      case "POST": {
        // POST /api/emergency-services?organizationId=123&reset=true
        if (req.query.reset === "true") {
          // 1) Smažeme všechny staré záznamy
          await prisma.emergencyService.deleteMany({
            where: { organizationId: orgId },
          });

          const defaults = [
            {
              label: "Policie ČR",
              number: "158",
              icon: "Shield",
              iconColor: "#0284C7",
              hasSms: true,
            },
            {
              label: "Městská policie",
              number: "156",
              icon: "Shield",
              iconColor: "#1E40AF",
              hasSms: true,
            },
            {
              label: "Záchranná služba",
              number: "155",
              icon: "Ambulance",
              iconColor: "#DC2626",
              hasSms: false,
            },
            {
              label: "Tísňová linka",
              number: "112",
              icon: "PhoneCall",
              iconColor: "#7C3AED",
              hasSms: true,
            },
            {
              label: "Hasiči",
              number: "150",
              icon: "Flame",
              iconColor: "#FBBF24",
              hasSms: true,
            },
          ];

          const created = await Promise.all(
            defaults.map((d) =>
              prisma.emergencyService.create({
                data: { ...d, organizationId: orgId },
              })
            )
          );

          io.to(`org-${orgId}`).emit("emergencyServicesReset", created);
          res.status(200).json(created);
          return;
        }

        // POST /api/emergency-services
        const { label, number, icon, iconColor, hasSms } = req.body;
        if (!label || !number || typeof hasSms !== "boolean") {
          res.status(400).json({ error: "Missing required fields" });
          return;
        }

        const created = await prisma.emergencyService.create({
          data: {
            label,
            number,
            icon,
            iconColor,
            hasSms,
            organizationId: orgId,
          },
        });

        // emituje událost na Frontend
        io.to(`org-${orgId}`).emit("emergencyServiceCreated", created);

        res.status(201).json(created);
        return;
      }

      case "PUT": {
        // PUT /api/emergency-services?id=456
        if (Array.isArray(req.body)) {
          const updates = req.body as { id: number; order: number }[];
          await prisma.$transaction(
            updates.map(({ id, order }) =>
              prisma.emergencyService.update({ where: { id }, data: { order } })
            )
          );
          io.to(`org-${orgId}`).emit("emergencyServicesReordered", updates);
          res.sendStatus(200);
          return;
        }

        const id = Number(req.query.id);

        if (!id) {
          res.status(400).json({ error: "Service ID is required" });
          return;
        }
        const { label, number, icon, iconColor, hasSms } = req.body;
        const result = await prisma.emergencyService.updateMany({
          where: { id, organizationId: orgId },
          data: { label, number, icon, iconColor, hasSms },
        });
        if (result.count === 0) {
          res.status(404).json({ error: "Not found or no permission" });
          return;
        }

        const updated = await prisma.emergencyService.findUnique({
          where: { id },
        });
        io.to(`org-${orgId}`).emit("emergencyServiceUpdated", updated);

        res.sendStatus(204);
        return;
      }

      case "DELETE": {
        // DELETE /api/emergency-services?id=456
        const id = Number(req.query.id);
        if (!id) {
          res.status(400).json({ error: "Service ID is required" });
          return;
        }
        const result = await prisma.emergencyService.deleteMany({
          where: { id, organizationId: orgId },
        });
        if (result.count === 0) {
          res.status(404).json({ error: "Not found or no permission" });
          return;
        }

        io.to(`org-${orgId}`).emit("emergencyServiceDeleted", { id });

        res.sendStatus(204);
        return;
      }

      default:
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
  } catch (error) {
    console.error(`Error in emergencyServiceHandler [${method}]:`, error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
