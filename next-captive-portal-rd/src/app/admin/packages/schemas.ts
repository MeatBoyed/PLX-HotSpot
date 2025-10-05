import { z } from 'zod';

export const PackageCreateSchema = z.object({
  ssid: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional().nullable(),
  price: z.coerce.number().nonnegative(),
  radiusProfileId: z.coerce.number().int().positive(),
  radiusProfile: z.string().min(1).max(255),
  radiusRealmId: z.string().max(255).optional().nullable(),
  radiusCloudId: z.string().max(255).optional().nullable(),
});

export const PackageUpdateSchema = PackageCreateSchema.partial().omit({ ssid: true });
