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

type Row = { id: string; userEmail: string; package: string; amount: number; date: string; status: string };

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api.get('/admin/reports').then((r) => setRows(r.data.data)).catch((err) => toast(getErrorMessage(err), 'error'));
  }, [toast]);

  const exportCsv = () => {
    const header = 'ID,User Email,Package,Amount,Date,Status\n';
    const body = rows
      .map((r) => `${r.id},${r.userEmail},${r.package},${r.amount},${new Date(r.date).toISOString()},${r.status}`)
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wanderly-transactions.csv';
    a.click();
  };

  return (
    <DashboardShell role="admin" items={nav}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Transaction reports</h1>
        <Button variant="outline" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Package</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td className="px-4 py-3">{r.userEmail}</td>
                <td className="px-4 py-3">{r.package}</td>
                <td className="px-4 py-3">{formatCurrency(r.amount)}</td>
                <td className="px-4 py-3">{new Date(r.date).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
