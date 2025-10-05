"use server";

import { packageService, type Package } from '@/lib/services/package-service';
import { PackageCreateSchema, PackageUpdateSchema } from './schemas';

export async function listPackagesAction(ssid: string): Promise<Package[]> {
  return packageService.list(ssid);
}

export async function createPackageAction(input: unknown): Promise<Package> {
  const data = PackageCreateSchema.parse(input);
  return packageService.create(data);
}

export async function updatePackageAction(ssid: string, id: number, input: unknown): Promise<Package> {
  const data = PackageUpdateSchema.parse(input);
  const updated = await packageService.update(ssid, id, data);
  if (!updated) throw new Error('Package not found');
  return updated;
}

export async function deletePackageAction(ssid: string, id: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const ok = await packageService.remove(ssid, id);
  return ok ? { ok: true } : { ok: false, error: 'Package not found' };
}

