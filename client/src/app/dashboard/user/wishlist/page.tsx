'use client';

import { useEffect, useState } from 'react';
import { api, TourPackage, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { TourCard } from '@/components/tours/TourCard';
import { useToast } from '@/contexts/ToastContext';

const nav = [
  { href: '/dashboard/user', label: 'Overview' },
  { href: '/dashboard/user/bookings', label: 'My Bookings' },
  { href: '/dashboard/user/wishlist', label: 'Wishlist' },
  { href: '/dashboard/user/profile', label: 'Profile & Settings' },
];

export default function WishlistPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<TourPackage[]>([]);

  useEffect(() => {
    api.get('/wishlist').then((r) => setItems(r.data.data)).catch((err) => toast(getErrorMessage(err), 'error'));
  }, [toast]);

  return (
    <DashboardShell role="user" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Wishlist</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {items.map((pkg) => (
          <TourCard key={pkg._id} pkg={pkg} />
        ))}
      </div>
      {items.length === 0 && <p className="mt-8 text-slate-muted">Save tours from package pages to compare later.</p>}
    </DashboardShell>
  );
}
