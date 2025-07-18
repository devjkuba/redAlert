import { Request, Response } from "express";
import { prisma } from "./prisma";
import { io } from "./server";
import { sendEmail } from "./mailer";
import { sendWebPushToOrg } from "./pushUtils";
import cron, { ScheduledTask } from "node-cron";

const cronJobsByOrgType = new Map<string, ScheduledTask>();

const cronJobLocks = new Set<string>();

export const notificationshandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { method } = req;

  switch (method) {
    case "GET": {
      const orgId = Number(req.query.orgId);
      if (!orgId) {
        res.status(400).json({ error: "Missing or invalid organization ID" });
        return;
      }

      try {
        const notifications = await prisma.notification.findMany({
          where: { organizationId: orgId },
          include: { triggeredBy: true },
          orderBy: { createdAt: "desc" },
          take: 100,
        });
        res.status(200).json(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Error fetching notifications" });
      }
      break;
    }

    case "POST": {
      const {
        type,
        message,
        triggeredById,
        latitude,
        longitude,
        organizationId,
        status,
      } = req.body;

      if (!type || !message || !triggeredById || !organizationId || !status) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const orgId = Number(organizationId);
      const senderId = Number(triggeredById);
      const intervalSec = 30;
      const jobKey = `${orgId}-${type}`;

      if (cronJobLocks.has(jobKey)) {
        res.status(429).json({ error: "Processing in progress, try again shortly" });
        return;
      }
      cronJobLocks.add(jobKey);

      try {
        const latestNotification = await prisma.notification.findFirst({
          where: {
            organizationId: orgId,
            type,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        for (const [key, job] of cronJobsByOrgType.entries()) {
          if (key.startsWith(orgId + "-")) {
            job.stop();
            cronJobsByOrgType.delete(key);
          }
        }

        const organization = await prisma.organization.findUnique({
          where: { id: orgId },
          select: { name: true },
        });

        const savedNotification = await prisma.notification.create({
          data: {
            type,
            message,
            status,
            triggeredById: senderId,
            organizationId: orgId,
          },
        });

        await prisma.message.create({
          data: {
            text: message,
            type: "ALARM",
            status,
            senderId,
            latitude,
            longitude,
            organizationId: orgId,
          },
        });

        const sender = await prisma.user.findUnique({
          where: { id: senderId },
          select: { firstName: true, lastName: true },
        });

        const users = await prisma.user.findMany({
          where: {
            organizationId: orgId,
            isActive: true,
            emailNotificationsEnabled: true,
          },
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        });

        const senderName = sender
          ? [sender.firstName, sender.lastName].filter(Boolean).join(" ")
          : "";
        const emailPromises = users.map((user) => {
          if (!user.email) return Promise.resolve();
          return sendEmail({
            to: user.email,
            subject: `Nová notifikace: ${type}`,
            text: `${message}\nOdesílatel: ${senderName}\nOrganizace: ${
              organization?.name ?? ""
            }`,
          });
        });

        await Promise.all(emailPromises);

        await sendWebPushToOrg(orgId, `Notifikace: ${type}`, message);

        io.to(`org-${orgId}`).emit("newNotification", savedNotification);

        if (latestNotification?.status === "ACTIVE" && latestNotification.type === type) {
          res.status(201).json({ message: "Notification created successfully" });

          return;
        }

        if (status === "ACTIVE") {
          const cronExpr = `*/${intervalSec} * * * * *`;
          const task: ScheduledTask = cron.schedule(cronExpr, async () => {
            await sendWebPushToOrg(orgId, `Notifikace: ${type}`, message);
          });
          task.start();
          cronJobsByOrgType.set(jobKey, task);
        }

        res.status(201).json({ message: "Notification created successfully" });
      } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Error creating notification" });
      } finally {
        cronJobLocks.delete(jobKey);
      }
      break;
    }

    default:
      res.status(405).json({ error: "Method not allowed" });
      break;
  }
};
