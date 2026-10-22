'use client';

import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
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

type Row = {
  _id: string;
  status: string;
  totalAmount: number;
  contactEmail: string;
  stripePaymentIntentId?: string;
  user?: { email: string };
  package?: { title: string };
};

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);

  const load = () => api.get('/admin/bookings').then((r) => setRows(r.data.data)).catch((err) => toast(getErrorMessage(err), 'error'));
  useEffect(() => {
    load();
  }, [toast]);

  const setStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/bookings/${id}`, { status });
      toast('Status updated', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <DashboardShell role="admin" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Manage bookings</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{b.user?.email || b.contactEmail}</td>
                <td className="px-4 py-3">{b.package?.title}</td>
                <td className="px-4 py-3">{formatCurrency(b.totalAmount)}</td>
                <td className="px-4 py-3 capitalize">{b.status}</td>
                <td className="px-4 py-3 text-xs">{b.stripePaymentIntentId || '—'}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-xl border px-2 py-1 dark:bg-slate-900"
                    value={b.status}
                    onChange={(e) => setStatus(b._id, e.target.value)}
                  >
                    {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
