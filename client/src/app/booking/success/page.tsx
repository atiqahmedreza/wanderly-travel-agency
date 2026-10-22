'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/api';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

function SuccessContent() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<{ package: { title: string }; totalAmount: number; travelDate: string; travelers: number } | null>(null);

  const isDevCheckout = Boolean(params.get('dev_booking'));

  useEffect(() => {
    const sessionId = params.get('session_id');
    const devBooking = params.get('dev_booking');
    if (!sessionId && !devBooking) return;
    api
      .get('/bookings/confirm', {
        params: sessionId ? { session_id: sessionId } : { dev_booking: devBooking },
      })
      .then((r) => setBooking(r.data.data))
      .catch((err) => toast(getErrorMessage(err), 'error'));
  }, [params, toast]);

  if (!booking) return <PageSpinner />;

  return (
    <div className="section-pad mx-auto max-w-lg text-center">
      <h1 className="font-display text-3xl font-semibold text-ocean">Booking confirmed</h1>
      <p className="mt-3 text-slate-muted">
        {isDevCheckout
          ? 'Booking confirmed in development mode (Stripe not configured).'
          : 'Payment received via Stripe. Your adventure is on the calendar.'}
      </p>
      <div className="mt-8 rounded-xl border border-slate-200 p-6 text-left dark:border-slate-800">
        <p className="font-medium">{booking.package?.title}</p>
        <p className="mt-2 text-sm text-slate-muted">Travel date: {new Date(booking.travelDate).toLocaleDateString()}</p>
        <p className="text-sm text-slate-muted">Travelers: {booking.travelers}</p>
        <p className="mt-3 text-lg font-semibold text-ocean">{formatCurrency(booking.totalAmount)}</p>
      </div>
      <Link href="/dashboard/user/bookings" className="mt-8 inline-block">
        <Button variant="coral">View my bookings</Button>
      </Link>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <RouteGuard roles={['user', 'admin']}>
      <SuccessContent />
    </RouteGuard>
  );
}
