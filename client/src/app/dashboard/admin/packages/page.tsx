'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';

const nav = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Manage Users' },
  { href: '/dashboard/admin/packages', label: 'Manage Packages' },
  { href: '/dashboard/admin/bookings', label: 'Manage Bookings' },
  { href: '/dashboard/admin/destinations', label: 'Destinations & Categories' },
  { href: '/dashboard/admin/reports', label: 'Reports' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

type Pkg = { _id: string; title: string; price: number; durationDays: number; location: string };

export default function AdminPackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [destinations, setDestinations] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const form = useForm<Record<string, string>>();

  const load = () => {
    api.get('/admin/packages').then((r) => setPackages(r.data.data));
    api.get('/destinations').then((r) => setDestinations(r.data.data));
    api.get('/categories').then((r) => setCategories(r.data.data));
  };

  useEffect(() => {
    load();
  }, []);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImagesBase64((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const submit = async (values: Record<string, string>) => {
    try {
      const payload = {
        title: values.title,
        shortDescription: values.shortDescription,
        description: values.description,
        price: Number(values.price),
        durationDays: Number(values.durationDays),
        location: values.location,
        destination: values.destination,
        category: values.category,
        imagesBase64,
        inclusions: values.inclusions?.split('\n').filter(Boolean),
        exclusions: values.exclusions?.split('\n').filter(Boolean),
        itinerary: [{ day: 1, title: 'Day 1', description: values.itinerary || 'Guided experience' }],
        languages: ['English', 'Bengali'],
      };
      if (editId) await api.patch(`/admin/packages/${editId}`, payload);
      else await api.post('/admin/packages', payload);
      toast(editId ? 'Package updated' : 'Package created', 'success');
      setOpen(false);
      setEditId(null);
      setImagesBase64([]);
      form.reset();
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete package?')) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      toast('Deleted', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <DashboardShell role="admin" items={nav}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Manage packages</h1>
        <Button
          onClick={() => {
            setEditId(null);
            setOpen(true);
          }}
        >
          Add package
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3">${p.price}</td>
                <td className="px-4 py-3">{p.durationDays}d</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditId(p._id); setOpen(true); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p._id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit package' : 'Add package'} className="max-w-2xl">
        <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
          <Input label="Title" {...form.register('title', { required: true })} />
          <Input label="Short description" {...form.register('shortDescription', { required: true })} />
          <Input label="Full description" {...form.register('description', { required: true })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (USD)" type="number" {...form.register('price', { required: true })} />
            <Input label="Duration (days)" type="number" {...form.register('durationDays', { required: true })} />
          </div>
          <Input label="Location" {...form.register('location', { required: true })} />
          <div>
            <label htmlFor="destination" className="text-sm font-medium">
              Destination
            </label>
            <select id="destination" className="mt-1 h-11 w-full rounded-xl border px-3 dark:bg-slate-900" {...form.register('destination', { required: true })}>
              <option value="">Select</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select id="category" className="mt-1 h-11 w-full rounded-xl border px-3 dark:bg-slate-900" {...form.register('category', { required: true })}>
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="images" className="text-sm font-medium">
              Images (upload to imgBB)
            </label>
            <input id="images" type="file" multiple accept="image/*" className="mt-1 w-full text-sm" onChange={(e) => onFiles(e.target.files)} />
          </div>
          <Input label="Inclusions (one per line)" {...form.register('inclusions')} />
          <Input label="Exclusions (one per line)" {...form.register('exclusions')} />
          <Input label="Itinerary summary" {...form.register('itinerary')} />
          <Button type="submit" className="w-full">
            Save package
          </Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
