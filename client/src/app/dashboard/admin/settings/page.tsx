'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/Card';

const nav = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Manage Users' },
  { href: '/dashboard/admin/packages', label: 'Manage Packages' },
  { href: '/dashboard/admin/bookings', label: 'Manage Bookings' },
  { href: '/dashboard/admin/destinations', label: 'Destinations & Categories' },
  { href: '/dashboard/admin/reports', label: 'Reports' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

export default function AdminSettingsPage() {
  return (
    <DashboardShell role="admin" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <Card className="mt-6 max-w-xl space-y-3 p-6 text-sm text-slate-600 dark:text-slate-300">
        <p>Configure Stripe, imgBB, and MongoDB through server environment variables on your host.</p>
        <p>Client URL must match your deployed website URL (Render) for CORS and Stripe redirect URLs.</p>
        <p>Primary admin: admin@wanderly.com — role changes are locked for this account.</p>
      </Card>
    </DashboardShell>
  );
}
