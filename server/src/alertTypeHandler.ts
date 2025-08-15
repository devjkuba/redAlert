import { Request, Response } from "express";
import { prisma } from "./prisma";
import { io } from "./server";

export const alertTypeHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { method } = req;
  const orgId = Number(req.query.organizationId);

  try {
    switch (method) {
      case "GET": {
        // GET /api/alert-types?organizationId=123
        const alerts = await prisma.alertType.findMany({
          where: { organizationId: orgId },
          orderBy: { order: "asc" },
         include: {
            notifications: {
              where: {
                status: "ACTIVE",
                alertTypeId: { not: null }
              },
              select: { id: true },
            },
          },
        });
        const alertsWithCount = alerts.map((a) => ({
          ...a,
          activeCount: a.notifications.length,
        }));

        res.status(200).json(alertsWithCount);
        return;
      }

      case "POST": {
        // POST /api/alert-types?organizationId=123&reset=true
        if (req.query.reset === "true") {
          await prisma.alertType.deleteMany({
            where: { organizationId: orgId },
          });

          const defaults = [
            {
              label: "Zdravotní pomoc",
              icon: "HeartPulse",
              className: "from-red-500 to-pink-600",
            },
            {
              label: "Požár",
              icon: "Flame",
              className: "from-orange-500 to-red-500",
            },
            {
              label: "Vniknutí",
              icon: "DoorOpen",
              className: "from-indigo-600 to-indigo-700",
            },
            {
              label: "Rvačka",
              icon: "FightIcon",
              className: "from-purple-500 to-purple-600",
            },
            {
              label: "Evakuace",
              icon: "LogOut",
              className: "from-green-500 to-green-600",
            },
            {
              label: "Vandalismus",
              icon: "SprayCan",
              className: "from-pink-500 to-pink-600",
            },
            {
              label: "Výpadek proudu",
              icon: "PlugZap",
              className: "from-yellow-500 to-orange-700",
            },
            {
              label: "Aktivní útočník",
              icon: "GunIcon",
              className: "from-gray-500 to-gray-900",
            },
            {
              label: "Únik plynu",
              icon: "GasIcon",
              className: "from-yellow-500 to-lime-600",
            },
          ];

          const created = await Promise.all(
            defaults.map((d, index) =>
              prisma.alertType.create({
                data: { ...d, order: index + 1, organizationId: orgId },
              })
            )
          );

          io.to(`org-${orgId}`).emit("alertTypesReset", created);
          res.status(200).json(created);
          return;
        }

        const count = await prisma.alertType.count({
          where: { organizationId: orgId },
        });
        if (count >= 12) {
          res
            .status(400)
            .json({ error: "Maximální počet vlastních upozornění je 12" });
          return;
        }

        const { label, icon, className, order } = req.body;
        if (!label || !icon) {
          res.status(400).json({ error: "Missing required fields" });
          return;
        }

        const created = await prisma.alertType.create({
          data: {
            label,
            icon,
            className,
            order: order ?? 0,
            organizationId: orgId,
          },
        });

        io.to(`org-${orgId}`).emit("alertTypeCreated", created);

        res.status(201).json(created);
        return;
      }

      case "PUT": {
        // reorder
        if (Array.isArray(req.body)) {
          const updates = req.body as { id: number; order: number }[];
          await prisma.$transaction(
            updates.map(({ id, order }) =>
              prisma.alertType.update({ where: { id }, data: { order } })
            )
          );
          io.to(`org-${orgId}`).emit("alertTypesReordered", updates);
          res.sendStatus(200);
          return;
        }

        const id = Number(req.query.id);
        if (!id) {
          res.status(400).json({ error: "AlertType ID is required" });
          return;
        }

        const { label, icon, className, order } = req.body;
        const result = await prisma.alertType.updateMany({
          where: { id, organizationId: orgId },
          data: { label, icon, className, order },
        });

        if (result.count === 0) {
          res.status(404).json({ error: "Not found or no permission" });
          return;
        }

        const updated = await prisma.alertType.findUnique({ where: { id } });
        io.to(`org-${orgId}`).emit("alertTypeUpdated", updated);

        res.sendStatus(204);
        return;
      }

      case "DELETE": {
        const id = Number(req.query.id);
        if (!id) {
          res.status(400).json({ error: "AlertType ID is required" });
          return;
        }
        const result = await prisma.alertType.deleteMany({
          where: { id, organizationId: orgId },
        });
        if (result.count === 0) {
          res.status(404).json({ error: "Not found or no permission" });
          return;
        }

        io.to(`org-${orgId}`).emit("alertTypeDeleted", { id });

        res.sendStatus(204);
        return;
      }

      default:
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
  } catch (error) {
    console.error(`Error in alertTypeHandler [${method}]:`, error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
