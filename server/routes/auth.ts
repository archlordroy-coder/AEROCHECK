import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { registerSchema, loginSchema } from "../lib/validation.js";
import { logger } from "../lib/logger.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

router.post("/register", async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, firstName, lastName, role, function: userFunction, phone, countryId, airportId } = validatedData;

    const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        function: userFunction,
        phone,
        countryId,
        airportId,
      },
      select: { id: true, email: true }
    });

    logger.info({ userId: user.id, email: user.email }, "New user registered");
    res.status(201).json({ message: "User created", userId: user.id });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        country: { select: { name: true } },
        airport: { select: { name: true } }
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Account suspended" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    logger.info({ userId: user.id, role: user.role }, "User logged in");

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        country: user.country?.name,
        airport: user.airport?.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
