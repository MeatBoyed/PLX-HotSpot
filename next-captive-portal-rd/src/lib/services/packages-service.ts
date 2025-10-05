import { PrismaClient, Prisma } from '../../../generated/prisma';
import { env } from '@/env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();
if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type PackageRecord = {
  id: number;
  ssid: string;
  name: string;
  price: number;
  description?: string | null;
  radiusProfileId: number;
  radiusProfile: string;
  radiusRealmId?: string | null;
  radiusCloudId?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

const selectPackage = {
  id: true,
  ssid: true,
  name: true,
  price: true,
  description: true,
  radiusProfileId: true,
  radiusProfile: true,
  radiusRealmId: true,
  radiusCloudId: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.PackagesSelect;

export const packagesService = {
  async list(ssid: string): Promise<PackageRecord[]> {
    const rows = await prisma.packages.findMany({ where: { ssid }, orderBy: { id: 'asc' }, select: selectPackage });
    return rows as unknown as PackageRecord[];
  },
  async create(input: Omit<PackageRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PackageRecord> {
    try {
      const created = await prisma.packages.create({ data: input as any, select: selectPackage });
      return created as unknown as PackageRecord;
    } catch (err) {
      if ((err as any)?.code === 'P2002') {
        throw new Error('A package with this name already exists for this SSID');
      }
      throw err;
    }
  },
  async update(id: number, ssid: string, updates: Partial<Omit<PackageRecord, 'id' | 'ssid'>>): Promise<PackageRecord> {
    try {
      const updated = await prisma.packages.update({ where: { id }, data: { ...updates, ssid } as any, select: selectPackage });
      return updated as unknown as PackageRecord;
    } catch (err) {
      if ((err as any)?.code === 'P2002') {
        throw new Error('A package with this name already exists for this SSID');
      }
      throw err;
    }
  },
  async remove(id: number): Promise<void> {
    await prisma.packages.delete({ where: { id } });
  },
};
