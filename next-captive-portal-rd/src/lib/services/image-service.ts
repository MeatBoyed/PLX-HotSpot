import { prisma } from '@/lib/services/database-service';
import crypto from 'crypto';

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
  /** Overwrite canonical (ssid, slug) image; if it exists, create a timestamped backup row before updating. */
  async overwriteWithBackup(ssid: string, slug: string, mimeType: string, data: Buffer): Promise<{ sha256: string; size: number; mimeType: string }>{
    if (!ssid || !slug) throw new Error('Missing ssid or slug');
    if (!data || data.length === 0) throw new Error('Empty image data');
    const existing = await prisma.branding_image.findUnique({ where: { ssid_slug: { ssid, slug } }, select: { mime_type: true, data: true, sha256_hash: true, size_bytes: true } });
    // If an image exists for this slug, create a backup row with a timestamped slug
    if (existing) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const backupSlug = `${slug}-${ts}`;
      await prisma.branding_image.create({
        data: {
          ssid,
          slug: backupSlug,
          mime_type: existing.mime_type,
          data: existing.data,
          sha256_hash: existing.sha256_hash,
          size_bytes: existing.size_bytes,
        }
      });
    }
    // Now upsert canonical with new content
    return this.upsert(ssid, slug, mimeType, data);
  },
  /** Upsert (overwrite) a branding image by (ssid, slug). Returns stored metadata summary. */
  async upsert(ssid: string, slug: string, mimeType: string, data: Buffer): Promise<{ sha256: string; size: number; mimeType: string }>{
    if (!ssid || !slug) throw new Error('Missing ssid or slug');
    if (!data || data.length === 0) throw new Error('Empty image data');
    const base64 = data.toString('base64');
    const sha256 = crypto.createHash('sha256').update(data).digest('hex');
    const now = new Date();
    await prisma.branding_image.upsert({
      where: { ssid_slug: { ssid, slug } },
      update: { mime_type: mimeType, data: base64, sha256_hash: sha256, size_bytes: data.length, updated_at: now },
      create: { ssid, slug, mime_type: mimeType, data: base64, sha256_hash: sha256, size_bytes: data.length, updated_at: now },
    });
    return { sha256, size: data.length, mimeType };
  },
};
