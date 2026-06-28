ALTER TABLE "branding_config" ADD COLUMN "splash_background" varchar(255);--> statement-breakpoint
ALTER TABLE "branding_config" ADD COLUMN "splash_heading" varchar(255);--> statement-breakpoint
ALTER TABLE "branding_config" ADD COLUMN "auth_methods" text[] DEFAULT '{"free"}' NOT NULL;