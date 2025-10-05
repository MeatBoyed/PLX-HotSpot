import { prisma } from '@/lib/services/database-service';

export type ImageRecord = {
  mimeType: string;
  dataBase64: string;
  sha256?: string;
  updatedAt?: Date | null;
};

export const imageService = {
  async getBySlug(ssid: string, slug: string): Promise<ImageRecord | null> {
    const row = await prisma.branding_image.findUnique({
      where: { ssid_slug: { ssid, slug } },
      select: { mime_type: true, data: true, sha256_hash: true, updated_at: true },
    });
    if (!row) return null;
    return {
      mimeType: row.mime_type,
      dataBase64: row.data,
      sha256: row.sha256_hash ?? undefined,
      updatedAt: row.updated_at ?? undefined,
    };
  },
};
