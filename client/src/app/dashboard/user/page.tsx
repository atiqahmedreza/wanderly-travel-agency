'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

const nav = [
  { href: '/dashboard/user', label: 'Overview' },
  { href: '/dashboard/user/bookings', label: 'My Bookings' },
  { href: '/dashboard/user/wishlist', label: 'Wishlist' },
  { href: '/dashboard/user/profile', label: 'Profile & Settings' },
];

export default function UserDashboardPage() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<{ totalBookings: number; upcomingTrips: number; totalSpent: number; wishlistCount: number } | null>(null);
  const [chart, setChart] = useState<{ label: string; amount: number }[]>([]);

  useEffect(() => {
    Promise.all([api.get('/bookings/overview'), api.get('/bookings/spending-chart')])
      .then(([o, c]) => {
        setOverview(o.data.data);
        setChart(c.data.data);
      })
      .catch((err) => toast(getErrorMessage(err), 'error'));
  }, [toast]);

  return (
    <DashboardShell role="user" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overview &&
          [
            ['Total bookings', overview.totalBookings],
            ['Upcoming trips', overview.upcomingTrips],
            ['Total spent', formatCurrency(overview.totalSpent)],
            ['Wishlist', overview.wishlistCount],
          ].map(([label, value]) => (
            <Card key={label as string} className="p-5">
              <p className="text-sm text-slate-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-ocean">{value}</p>
            </Card>
          ))}
      </div>
      <Card className="mt-8 p-5">
        <h2 className="font-display text-xl font-semibold">Spending over time</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="amount" stroke="#0D9488" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </DashboardShell>
  );
}
