-- CreateTable
CREATE TABLE "branding_config" (
    "id" SERIAL NOT NULL,
    "ssid" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "brand_primary" VARCHAR(7) NOT NULL DEFAULT '#301358',
    "brand_primary_hover" VARCHAR(7) NOT NULL DEFAULT '#5B3393',
    "brand_secondary" VARCHAR(7) NOT NULL DEFAULT '#F2F2F2',
    "brand_accent" VARCHAR(7) NOT NULL DEFAULT '#F60031',
    "text_primary" VARCHAR(7) NOT NULL DEFAULT '#181818',
    "text_secondary" VARCHAR(7) NOT NULL DEFAULT '#5D5D5D',
    "text_tertiary" VARCHAR(7) NOT NULL DEFAULT '#7A7A7A',
    "text_muted" VARCHAR(7) NOT NULL DEFAULT '#CECECE',
    "surface_card" VARCHAR(7) NOT NULL DEFAULT '#F2F2F2',
    "surface_white" VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    "surface_border" VARCHAR(7) NOT NULL DEFAULT '#CECECE',
    "button_primary" VARCHAR(7) NOT NULL DEFAULT '#301358',
    "button_primary_hover" VARCHAR(7) NOT NULL DEFAULT '#5B3393',
    "button_primary_text" VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    "button_secondary" VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    "button_secondary_hover" VARCHAR(7) NOT NULL DEFAULT '#f5f5f5',
    "button_secondary_text" VARCHAR(7) NOT NULL DEFAULT '#301358',
    "logo" VARCHAR(255) NOT NULL DEFAULT '/pluxnet-logo.svg',
    "logo_white" VARCHAR(255) NOT NULL DEFAULT '/pluxnet-logo-white.svg',
    "connect_card_background" VARCHAR(255) NOT NULL DEFAULT '/internet-claim-bg.png',
    "banner_overlay" VARCHAR(255),
    "favicon" VARCHAR(255),
    "terms_links" TEXT,
    "heading" VARCHAR(255),
    "subheading" VARCHAR(255),
    "button_text" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ads_revive_server_url" VARCHAR(255),
    "ads_zone_id" VARCHAR(255),
    "ads_revive_id" VARCHAR(255),
    "ads_vast_url" VARCHAR(255),
    "splash_background" VARCHAR(255),
    "splash_heading" VARCHAR(255),
    "auth_methods" TEXT[] DEFAULT ARRAY['free']::TEXT[],

    CONSTRAINT "branding_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branding_image" (
    "id" SERIAL NOT NULL,
    "ssid" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sha256_hash" VARCHAR(64) NOT NULL,
    "data" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branding_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branding_config_ssid_unique" ON "branding_config"("ssid");

-- CreateIndex
CREATE UNIQUE INDEX "branding_image_ssid_slug_unique" ON "branding_image"("ssid", "slug");

