'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

const nav = [
  { href: '/dashboard/user', label: 'Overview' },
  { href: '/dashboard/user/bookings', label: 'My Bookings' },
  { href: '/dashboard/user/wishlist', label: 'Wishlist' },
  { href: '/dashboard/user/profile', label: 'Profile & Settings' },
];

type Booking = {
  _id: string;
  status: string;
  travelDate: string;
  travelers: number;
  totalAmount: number;
  package: { title: string; slug: string };
};

export default function UserBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = () => {
    api.get('/bookings/me').then((r) => setBookings(r.data.data)).catch((err) => toast(getErrorMessage(err), 'error'));
  };

  useEffect(() => {
    load();
  }, [toast]);

  const cancel = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast('Booking cancelled', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <DashboardShell role="user" items={nav}>
      <h1 className="font-display text-3xl font-semibold">My bookings</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Travelers</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{b.package?.title}</td>
                <td className="px-4 py-3">{new Date(b.travelDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{b.travelers}</td>
                <td className="px-4 py-3">{formatCurrency(b.totalAmount)}</td>
                <td className="px-4 py-3 capitalize">
                  <Badge variant={b.status === 'confirmed' ? 'ocean' : 'default'}>{b.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/packages/${b.package?.slug}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                    {['pending', 'confirmed'].includes(b.status) && (
                      <Button size="sm" variant="ghost" onClick={() => cancel(b._id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
