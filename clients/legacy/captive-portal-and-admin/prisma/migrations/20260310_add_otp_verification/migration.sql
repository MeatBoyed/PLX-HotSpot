-- CreateTable
CREATE TABLE "otp_verification" (
    "id" SERIAL NOT NULL,
    "ssid" VARCHAR(255) NOT NULL,
    "msisdn" VARCHAR(15) NOT NULL,
    "otp_code" VARCHAR(4) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verification_pkey" PRIMARY KEY ("id")
);
