import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, AuthRequest } from "../lib/auth.js";
import { validateLicenseSchema, submitLicenseSchema } from "../lib/validation.js";
import { logger } from "../lib/logger.js";

const router = Router();

router.get("/my-license", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const license = await prisma.license.findFirst({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: "desc" },
    });

    if (!license) {
      return res.status(404).json({ message: "License not found" });
    }

    res.json(license);
  } catch (error) {
    next(error);
  }
});

router.post("/submit", authenticate, async (req: AuthRequest, res, next) => {
  if (req.user?.role !== "agent") return res.status(403).json({ message: "Forbidden" });

  try {
    const { documents } = submitLicenseSchema.parse(req.body);
    const userId = req.user.id;

    let license = await prisma.license.findFirst({
      where: { userId, status: { in: ["draft", "rejected"] } },
      orderBy: { createdAt: "desc" },
    });

    if (!license) {
      license = await prisma.license.create({
        data: { userId },
      });
    }

    // Process documents in transaction for reliability
    await prisma.$transaction(
      documents.map((doc) =>
        prisma.document.upsert({
          where: { id: doc.id || "new-doc-" + doc.type + "-" + Date.now() },
          create: {
            licenseId: license.id,
            type: doc.type,
            fileUrl: doc.fileUrl,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
          },
          update: {
            fileUrl: doc.fileUrl,
            expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
            status: "pending",
          },
        })
      )
    );

    await prisma.license.update({
      where: { id: license.id },
      data: { status: "pending_qip" },
    });

    logger.info({ userId, licenseId: license.id }, "License submitted");

    res.json({ message: "License submitted", licenseId: license.id });
  } catch (error) {
    next(error);
  }
});

router.post("/validate/:licenseId", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { licenseId } = req.params;
    const { status, comment } = validateLicenseSchema.parse(req.body);

    const license = await prisma.license.findUnique({
      where: { id: licenseId },
      include: { user: { select: { email: true, countryId: true } } },
    });

    if (!license) return res.status(404).json({ message: "License not found" });

    // Role-based validation logic
    let nextStatus = status;
    const userRole = req.user?.role;

    if (userRole === "qip") {
      nextStatus = status === "approved" ? "pending_dlaa" : "rejected";
    } else if (userRole === "dlaa") {
      nextStatus = status === "approved" ? "approved" : "rejected";
    } else if (userRole !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.$transaction([
      prisma.license.update({
        where: { id: licenseId },
        data: { status: nextStatus },
      }),
      prisma.auditLog.create({
        data: {
          userId: req.user!.id,
          action: `VALIDATE_${nextStatus.toUpperCase()}`,
          details: `License status changed to ${nextStatus}. Comment: ${comment || "No comment"}`,
        },
      }),
    ]);

    logger.info({ licenseId, validatorId: req.user!.id, nextStatus }, "License validated");

    res.json({ message: "Status updated", status: nextStatus });
  } catch (error) {
    next(error);
  }
});

export default router;
