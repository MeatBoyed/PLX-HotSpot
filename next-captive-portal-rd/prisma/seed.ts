/**
 * Seed script — AuraConnect schools
 *
 * Reads the existing IH Harris row and upserts all remaining schools
 * using it as the base template, overriding only ssid, name, and heading.
 *
 * Run with:  npx tsx prisma/seed.ts
 */

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BASE_SSID = "ih-harris";

const SCHOOLS = [
  {
    ssid: "letare",
    name: "Letare Secondary School",
    heading: "Welcome to Letare Secondary School AuraConnect WiFi Platform",
  },
  {
    ssid: "khololwane",
    name: "Khololwane Primary School",
    heading: "Welcome to Khololwane Primary School AuraConnect WiFi Platform",
  },
  {
    ssid: "emathafeni",
    name: "Emathafeni Primary School",
    heading: "Welcome to Emathafeni Primary School AuraConnect WiFi Platform",
  },
  {
    ssid: "itirele-zenzele",
    name: "Itirele Zenzele Comprehensive School",
    heading: "Welcome to Itirele Zenzele Comprehensive School AuraConnect WiFi Platform",
  },
  {
    ssid: "entandweni",
    name: "Entandweni Primary School",
    heading: "Welcome to Entandweni Primary School AuraConnect WiFi Platform",
  },
  {
    ssid: "centurion",
    name: "Centurion College",
    heading: "Welcome to Centurion College AuraConnect WiFi Platform",
  },
  {
    ssid: "st-enders",
    name: "St Enders Secondary School",
    heading: "Welcome to St Enders Secondary School AuraConnect WiFi Platform",
  },
  {
    ssid: "fellowship",
    name: "Fellowship Church",
    heading: "Welcome to Fellowship Church AuraConnect WiFi Platform",
  },
  {
    ssid: "denever",
    name: "Denever Primary School",
    heading: "Welcome to Denever Primary School AuraConnect WiFi Platform",
  },
];

async function main() {
  // Fetch the base IH Harris row
  const base = await prisma.branding_config.findUnique({
    where: { ssid: BASE_SSID },
  });

  if (!base) {
    throw new Error(
      `Base row not found: ssid="${BASE_SSID}". Make sure IH Harris exists in the database before running this seed.`
    );
  }

  console.log(`Base row found: ${base.name} (${base.ssid})`);

  // Strip fields that must be unique or auto-generated
  const { id, ssid, name, heading, created_at, updated_at, ...sharedFields } = base;

  for (const school of SCHOOLS) {
    await prisma.branding_config.upsert({
      where: { ssid: school.ssid },
      create: {
        ...sharedFields,
        ssid: school.ssid,
        name: school.name,
        heading: school.heading,
      },
      update: {
        name: school.name,
        heading: school.heading,
        updated_at: new Date(),
      },
    });

    console.log(`  Upserted: ${school.name} (${school.ssid})`);
  }

  console.log(`\nDone — ${SCHOOLS.length} schools seeded.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
