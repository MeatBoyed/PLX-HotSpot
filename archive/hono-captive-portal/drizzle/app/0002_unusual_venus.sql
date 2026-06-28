CREATE TABLE "branding_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"ssid" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" integer NOT NULL,
	"sha256_hash" varchar(64) NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "branding_image_ssid_slug_unique" ON "branding_image" USING btree ("ssid","slug");