import express from "express";
import { prisma } from "./prisma";

export const adminOrganizationsHandler = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  try {
    if (req.method === "POST") {
      // Vytvoření nové organizace
      const { name, gps, postalCode, street, city, country, hasMonitoring } =
        req.body;

      if (!name || !postalCode || !street || !city || !country) {
        res.status(400).json({ message: "All fields are required." });
        return;
      }

      const newOrganization = await prisma.organization.create({
        data: {
          name,
          gpsLat: parseFloat(gps?.lat ?? 0),
          gpsLng: parseFloat(gps?.lng ?? 0),
          postalCode,
          street,
          city,
          country,
          hasMonitoring: !!hasMonitoring,
        },
      });

      res.status(201).json({
        message: "Organization added successfully!",
        organization: newOrganization,
      });
    } else if (req.method === "GET") {
      // Seznam všech organizací s monitoringem
      const organizations = await prisma.organization.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          hasMonitoring: true,
          monitoringWatchers: {
            select: {
              targetOrg: {
                select: { id: true, name: true, city: true, country: true },
              },
            },
          },
          monitoringTargets: {
            select: {
              watcherOrg: {
                select: { id: true, name: true, city: true, country: true },
              },
            },
          },
        },
      });

      const result = organizations.map((org) => {
        const monitoringCount = org.monitoringWatchers.length;
        return {
          id: org.id,
          name: org.name,
          city: org.city,
          country: org.country,
          hasMonitoring: monitoringCount > 0,
          monitoringCount, // kolik organizací sleduju já
          watching: org.monitoringWatchers.map((w) => w.targetOrg), // které organizace sleduju
          watchedByCount: org.monitoringTargets.length, // kolik organizací sleduje mě
          watchedBy: org.monitoringTargets.map((t) => t.watcherOrg), // které organizace mě sledují
        };
      });

      res.status(200).json(result);
    } else if (req.method === "PUT") {
      // Aktualizace organizace (např. přepnutí monitoringu)
      const {
        id,
        name,
        gps,
        postalCode,
        street,
        city,
        country,
        hasMonitoring,
      } = req.body;

      if (!id) {
        res
          .status(400)
          .json({ message: "Organization ID is required for update." });
        return;
      }

      const updatedOrganization = await prisma.organization.update({
        where: { id: Number(id) },
        data: {
          name,
          gpsLat: gps ? parseFloat(gps.lat) : undefined,
          gpsLng: gps ? parseFloat(gps.lng) : undefined,
          postalCode,
          street,
          city,
          country,
          hasMonitoring:
            hasMonitoring !== undefined ? !!hasMonitoring : undefined,
        },
      });

      res.status(200).json({
        message: "Organization updated successfully!",
        organization: updatedOrganization,
      });
    } else if (req.method === "DELETE") {
      // Smazání organizace
      const { id } = req.body;

      if (!id) {
        res
          .status(400)
          .json({ message: "Organization ID is required for deletion." });
        return;
      }

      await prisma.organization.delete({ where: { id: Number(id) } });
      res.status(200).json({ message: "Organization deleted successfully!" });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
