"use client";

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useTheme } from '@/components/theme-provider';
import Head from '@/components/home-page/head';
import { listPackagesAction, createPackageAction, updatePackageAction, deletePackageAction } from './actions';
import { PackageCreateSchema, PackageUpdateSchema } from './schemas';

type Pkg = z.infer<typeof PackageCreateSchema> & { id?: number };

const CreateSchema = PackageCreateSchema;
const UpdateSchema = PackageUpdateSchema;

export default function PackagesAdminPage() {
  const { theme } = useTheme();
  const ssid = theme?.ssid;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Pkg[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Pkg>>({});

  useEffect(() => {
    if (!ssid) return;
    (async () => {
      setLoading(true);
      try {
        const list = await listPackagesAction(ssid);
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [ssid]);

  const resetForm = () => setForm({ name: '', description: '', price: 0, radiusProfileId: 0, radiusProfile: '', radiusRealmId: '', radiusCloudId: '' });

  const onCreate = async () => {
    if (!ssid) return;
    const parsed = CreateSchema.safeParse({ ssid, ...form });
    if (!parsed.success) return;
    const created = await createPackageAction(parsed.data);
    setItems(prev => [...prev, created]);
    resetForm();
  };

  const onEdit = (id: number) => {
    const pkg = items.find(i => i.id === id);
    if (!pkg) return;
    setEditingId(id);
    setForm({ ...pkg });
  };

  const onUpdate = async () => {
    if (!ssid || editingId == null) return;
    const parsed = UpdateSchema.safeParse({ ...form });
    if (!parsed.success) return;
    const updated = await updatePackageAction(ssid, editingId, parsed.data);
    setItems(prev => prev.map(p => (p.id === editingId ? updated : p)));
    setEditingId(null);
    resetForm();
  };

  const onDelete = async (id: number) => {
    if (!ssid) return;
    const res = await deletePackageAction(ssid, id);
    if (res.ok) setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="md:min-w-xl md:max-w-3xl mx-auto py-8 space-y-8">
      <nav className="flex items-center justify-center w-full">
        <Head />
      </nav>
      <div>
        <h1 className="text-2xl font-semibold">Packages</h1>
        <p className="text-sm text-muted-foreground">Manage purchasable voucher packages for SSID: <span className="font-medium">{ssid}</span></p>
      </div>

      {/* Create / Edit form */}
      <div className="border rounded p-4 space-y-3">
        <h2 className="text-lg font-medium">{editingId ? 'Edit Package' : 'Create Package'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">Name
            <input className="w-full border rounded px-2 py-1" value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="text-sm">Price
            <input type="number" step="0.01" className="w-full border rounded px-2 py-1" value={form.price ?? 0} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
          </label>
          <label className="text-sm md:col-span-2">Description
            <input className="w-full border rounded px-2 py-1" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="text-sm">Radius Profile ID
            <input type="number" className="w-full border rounded px-2 py-1" value={form.radiusProfileId ?? 0} onChange={e => setForm(f => ({ ...f, radiusProfileId: Number(e.target.value) }))} />
          </label>
          <label className="text-sm">Radius Profile
            <input className="w-full border rounded px-2 py-1" value={form.radiusProfile ?? ''} onChange={e => setForm(f => ({ ...f, radiusProfile: e.target.value }))} />
          </label>
          <label className="text-sm">Radius Realm ID
            <input className="w-full border rounded px-2 py-1" value={form.radiusRealmId ?? ''} onChange={e => setForm(f => ({ ...f, radiusRealmId: e.target.value }))} />
          </label>
          <label className="text-sm">Radius Cloud ID
            <input className="w-full border rounded px-2 py-1" value={form.radiusCloudId ?? ''} onChange={e => setForm(f => ({ ...f, radiusCloudId: e.target.value }))} />
          </label>
        </div>
        <div className="flex gap-2">
          {editingId ? (
            <>
              <button className="border rounded px-3 py-1" onClick={onUpdate}>Update</button>
              <button className="border rounded px-3 py-1" onClick={() => { setEditingId(null); resetForm(); }}>Cancel</button>
            </>
          ) : (
            <button className="border rounded px-3 py-1" onClick={onCreate}>Create</button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-left">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Profile ID</th>
              <th className="px-3 py-2">Profile</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.price.toFixed(2)}</td>
                <td className="px-3 py-2">{p.radiusProfileId}</td>
                <td className="px-3 py-2">{p.radiusProfile}</td>
                <td className="px-3 py-2 space-x-2">
                  <button className="border rounded px-2 py-1" onClick={() => onEdit(p.id!)}>Edit</button>
                  <button className="border rounded px-2 py-1" onClick={() => onDelete(p.id!)}>Delete</button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No packages yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
