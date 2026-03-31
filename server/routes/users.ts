import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, AuthRequest } from "../lib/auth.js";

const router = Router();

router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        country: { select: { name: true } },
        airport: { select: { name: true } }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/users", authenticate, async (req: AuthRequest, res, next) => {
  const { role, countryId } = req.query;

  try {
    const filters: any = {};
    if (role) filters.role = role as string;
    if (countryId) filters.countryId = countryId as string;

    if (req.user?.role === "qip" || req.user?.role === "dlaa") {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { countryId: true }
      });
      filters.countryId = currentUser?.countryId;
    }

    const users = await prisma.user.findMany({
      where: filters,
      include: {
        country: { select: { name: true } },
        airport: { select: { name: true } },
        licenses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { documents: true }
        }
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
