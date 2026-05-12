/**
 * One-off script — reset diepsloot row
 *
 * Deletes the existing diepsloot row and recreates it
 * using randburg-taxi as the base, with diepsloot's own heading.
 *
 * Run with:  npx tsx prisma/scripts/reset-diepsloot.ts
 */

import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const base = await prisma.branding_config.findUnique({
    where: { ssid: "randburg-taxi" },
  });

  if (!base) {
    throw new Error('Base row not found: ssid="randburg-taxi". Make sure it exists in the database.');
  }

  console.log(`Base row found: ${base.name} (${base.ssid})`);

  // Delete existing diepsloot row
  await prisma.branding_config.deleteMany({
    where: { ssid: "diepsloot" },
  });
  console.log("Deleted existing diepsloot row.");

  // Strip unique/auto-generated fields from base
  const { id, ssid, name, heading, created_at, updated_at, ...sharedFields } = base;

  await prisma.branding_config.create({
    data: {
      ...sharedFields,
      ssid: "diepsloot",
      name: "Diepsloot AuraConnect Hotspot",
      heading: "Welcome to Diepsloot AuraConnect Hotspot",
    },
  });

  console.log("Created new diepsloot row based on randburg-taxi.");
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
