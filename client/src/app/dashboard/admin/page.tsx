'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Card } from '@/components/ui/Card';
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

const COLORS = ['#0D9488', '#F97316', '#0F172A', '#14B8A6', '#FB923C'];

export default function AdminOverviewPage() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<{ totalUsers: number; totalPackages: number; totalBookings: number; totalRevenue: number } | null>(null);
  const [charts, setCharts] = useState<{
    bookingsByDestination: { name: string; count: number }[];
    monthlyRevenue: { label: string; revenue: number }[];
    byCategory: { name: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    Promise.all([api.get('/admin/overview'), api.get('/admin/charts')])
      .then(([o, c]) => {
        setOverview(o.data.data);
        setCharts(c.data.data);
      })
      .catch((err) => toast(getErrorMessage(err), 'error'));
  }, [toast]);

  return (
    <DashboardShell role="admin" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Admin overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overview &&
          [
            ['Total users', overview.totalUsers],
            ['Total packages', overview.totalPackages],
            ['Total bookings', overview.totalBookings],
            ['Total revenue', formatCurrency(overview.totalRevenue)],
          ].map(([label, value]) => (
            <Card key={label as string} className="p-5">
              <p className="text-sm text-slate-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </Card>
          ))}
      </div>
      {charts && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-display text-lg font-semibold">Bookings by destination</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.bookingsByDestination}>
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-lg font-semibold">Monthly revenue</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyRevenue}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line dataKey="revenue" stroke="#F97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">Bookings by category</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {charts.byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
