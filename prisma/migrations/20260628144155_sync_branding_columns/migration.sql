-- Reconciles migration history with prisma/schema.prisma after the schema +
-- generated client were advanced without an accompanying migration.
--
-- PRODUCTION SAFETY: these objects may ALREADY EXIST on production (they were
-- applied out-of-band, which is how the drift arose). Every statement is
-- therefore guarded with IF NOT EXISTS so `prisma migrate deploy` is a no-op
-- against an environment that already has them, instead of failing with
-- "relation/column already exists". All changes are purely additive.

-- AlterTable
ALTER TABLE "branding_config" ADD COLUMN IF NOT EXISTS "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "parent_ssid" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "venue_label" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "venue_route" VARCHAR(255);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Packages" (
    "id" SERIAL NOT NULL,
    "ssid" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "radiusRealmId" VARCHAR(255),
    "radiusCloudId" VARCHAR(255),
    "radiusProfileId" INTEGER NOT NULL,
    "radiusProfile" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "marketing_opt_in_submission" (
    "id" SERIAL NOT NULL,
    "ssid" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "agreed" BOOLEAN NOT NULL DEFAULT true,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(512),
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "unsubscribed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_opt_in_submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "packages_ssid_name_unique" ON "Packages"("ssid", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "marketing_opt_in_ssid_idx" ON "marketing_opt_in_submission"("ssid");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "marketing_opt_in_unsubscribed_idx" ON "marketing_opt_in_submission"("unsubscribed");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "marketing_opt_in_ssid_email_unique" ON "marketing_opt_in_submission"("ssid", "email");
