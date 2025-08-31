import express from 'express';
import { isSuperAdmin } from './middlewares/isSuperAdmin';
import { prisma } from './prisma';

export const monitoringAccessHandler = express.Router();

monitoringAccessHandler.post('/', isSuperAdmin, async (req, res) => {
  const accesses = req.body; // očekává pole objektů

  if (!Array.isArray(accesses)) {
    res.status(400).json({ message: 'Expected an array of accesses' });
    return;
  }

  try {
    const createdAccesses = [];

    for (const access of accesses) {
      const { watcherOrgId, targetOrgId } = access;

      if (!watcherOrgId || !targetOrgId) continue; // přeskočíme nevalidní

      const created = await prisma.monitoringAccess.create({
        data: { watcherOrgId, targetOrgId },
      });
      createdAccesses.push(created);
    }

    if (createdAccesses.length === 0) {
      res.status(400).json({ message: 'No valid accesses to create' });
      return;
    }

    res.status(201).json({ message: 'Monitoring accesses created', accesses: createdAccesses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Odebrání vazby
monitoringAccessHandler.delete('/:id', isSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.monitoringAccess.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Monitoring access removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

monitoringAccessHandler.get('/:orgId', isSuperAdmin, async (req, res) => {
  const orgId = parseInt(req.params.orgId);

  try {
    const accesses = await prisma.monitoringAccess.findMany({
      where: { watcherOrgId: orgId },
      include: { watcherOrg: true, targetOrg: true },
    });

    res.status(200).json(accesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});