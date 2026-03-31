import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, AuthRequest } from "../lib/auth.js";

const router = Router();

router.get("/countries", async (req, res, next) => {
  try {
    const countries = await prisma.country.findMany({
      include: {
          _count: { select: { airports: true, users: true } }
      },
    });
    res.json(countries);
  } catch (error) {
    next(error);
  }
});

router.post("/countries", authenticate, async (req: AuthRequest, res, next) => {
  if (req.user?.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const { name } = req.body;
    const country = await prisma.country.create({
      data: { name },
    });
    res.status(201).json(country);
  } catch (error) {
    next(error);
  }
});

router.get("/airports", async (req, res, next) => {
  const { countryId } = req.query;
  try {
    const airports = await prisma.airport.findMany({
      where: countryId ? { countryId: String(countryId) } : {},
      include: { country: { select: { name: true } } },
    });
    res.json(airports);
  } catch (error) {
    next(error);
  }
});

router.post("/airports", authenticate, async (req: AuthRequest, res, next) => {
  if (req.user?.role !== "super_admin") return res.status(403).json({ message: "Forbidden" });

  try {
    const { name, countryId } = req.body;
    const airport = await prisma.airport.create({
      data: { name, countryId },
    });
    res.status(201).json(airport);
  } catch (error) {
    next(error);
  }
});

export default router;
