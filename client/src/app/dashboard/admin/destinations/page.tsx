'use client';

import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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

export default function AdminDestinationsPage() {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<{ _id: string; name: string; country: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [destForm, setDestForm] = useState({ name: '', slug: '', country: '', region: 'domestic', description: '', image: '' });
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' });

  const load = () => {
    api.get('/admin/destinations').then((r) => setDestinations(r.data.data));
    api.get('/admin/categories').then((r) => setCategories(r.data.data));
  };
  useEffect(load, []);

  return (
    <DashboardShell role="admin" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Destinations & categories</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl">Destinations</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {destinations.map((d) => (
              <li key={d._id} className="rounded-xl border px-3 py-2 dark:border-slate-800">
                {d.name} — {d.country}
              </li>
            ))}
          </ul>
          <form
            className="mt-4 space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post('/admin/destinations', destForm);
                toast('Destination added', 'success');
                load();
              } catch (err) {
                toast(getErrorMessage(err), 'error');
              }
            }}
          >
            <Input label="Name" value={destForm.name} onChange={(e) => setDestForm({ ...destForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
            <Input label="Country" value={destForm.country} onChange={(e) => setDestForm({ ...destForm, country: e.target.value })} />
            <Input label="Description" value={destForm.description} onChange={(e) => setDestForm({ ...destForm, description: e.target.value })} />
            <Input label="Image URL" value={destForm.image} onChange={(e) => setDestForm({ ...destForm, image: e.target.value })} />
            <Button type="submit">Add destination</Button>
          </form>
        </div>
        <div>
          <h2 className="font-display text-xl">Categories</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c._id} className="rounded-xl border px-3 py-2 dark:border-slate-800">
                {c.name}
              </li>
            ))}
          </ul>
          <form
            className="mt-4 space-y-2"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.post('/admin/categories', catForm);
                toast('Category added', 'success');
                load();
              } catch (err) {
                toast(getErrorMessage(err), 'error');
              }
            }}
          >
            <Input label="Name" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
            <Input label="Description" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            <Button type="submit">Add category</Button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
