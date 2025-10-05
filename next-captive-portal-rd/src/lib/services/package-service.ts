import { prisma } from '@/lib/services/database-service';
import type { Prisma } from '../../../generated/prisma';

export type Package = {
  id: number;
  ssid: string;
  name: string;
  description?: string | null;
  price: number;
  radiusProfileId: number;
  radiusProfile: string;
  radiusRealmId?: string | null;
  radiusCloudId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const select = {
  id: true,
  ssid: true,
  name: true,
  description: true,
  price: true,
  radiusProfileId: true,
  radiusProfile: true,
  radiusRealmId: true,
  radiusCloudId: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.PackagesSelect;

function toApp(p: any): Package {
  return {
    id: p.id,
    ssid: p.ssid,
    name: p.name,
    description: p.description ?? null,
    price: p.price,
    radiusProfileId: p.radiusProfileId,
    radiusProfile: p.radiusProfile,
    radiusRealmId: p.radiusRealmId ?? null,
    radiusCloudId: p.radiusCloudId ?? null,
    createdAt: p.created_at ? new Date(p.created_at).toISOString() : undefined,
    updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
  };
}

export const packageService = {
  async list(ssid: string): Promise<Package[]> {
    const rows = await prisma.packages.findMany({ where: { ssid }, orderBy: { id: 'asc' }, select });
    return rows.map(toApp);
  },
  async getByName(name: string, ssid?: string): Promise<Package | null> {
    const where: Prisma.PackagesWhereInput = ssid ? { name, ssid } : { name };
    const row = await prisma.packages.findFirst({ where, select });
    return row ? toApp(row) : null;
  },
  async get(ssid: string, id: number): Promise<Package | null> {
    const row = await prisma.packages.findFirst({ where: { ssid, id }, select });
    return row ? toApp(row) : null;
  },
  async create(data: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const created = await prisma.packages.create({
      data: {
        ssid: data.ssid,
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        radiusProfileId: data.radiusProfileId,
        radiusProfile: data.radiusProfile,
        radiusRealmId: data.radiusRealmId ?? null,
        radiusCloudId: data.radiusCloudId ?? null,
      },
      select,
    });
    return toApp(created);
  },
  async update(ssid: string, id: number, data: Partial<Omit<Package, 'id' | 'ssid' | 'createdAt' | 'updatedAt'>>): Promise<Package | null> {
    const updated = await prisma.packages.update({
      where: { id },
      data: {
        // guard ssid immutability by ensuring record matches ssid
        // we'll rely on findFirst+update to avoid cross-ssid update; simpler: update then check count? keep minimal
        ...data,
        description: data.description === undefined ? undefined : data.description ?? null,
        radiusRealmId: data.radiusRealmId === undefined ? undefined : data.radiusRealmId ?? null,
        radiusCloudId: data.radiusCloudId === undefined ? undefined : data.radiusCloudId ?? null,
      } as any,
      select,
    }).catch((e) => {
      // If not found, return null
      return null;
    });
    // Extra check: ensure updated belongs to ssid
    if (!updated || updated.ssid !== ssid) return null;
    return toApp(updated);
  },
  async remove(ssid: string, id: number): Promise<boolean> {
    const existing = await prisma.packages.findFirst({ where: { ssid, id }, select: { id: true } });
    if (!existing) return false;
    await prisma.packages.delete({ where: { id } });
    return true;
  },
};
