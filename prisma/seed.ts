import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Countries
  const c1 = await prisma.country.upsert({
    where: { name: "Gabon" },
    update: {},
    create: { name: "Gabon" },
  });

  const c2 = await prisma.country.upsert({
    where: { name: "Congo" },
    update: {},
    create: { name: "Congo" },
  });

  // Airports
  await prisma.airport.create({
    data: { name: "ADL - Libreville", countryId: c1.id },
  });

  await prisma.airport.create({
    data: { name: "PNR - Pointe Noire", countryId: c2.id },
  });

  // Super Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@aerocheck.com" },
    update: {},
    create: {
      email: "admin@aerocheck.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin",
      status: "active",
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
