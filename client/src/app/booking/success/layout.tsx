import { Suspense } from 'react';
import { PageSpinner } from '@/components/ui/Spinner';

export default function BookingSuccessLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}
