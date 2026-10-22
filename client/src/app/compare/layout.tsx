import { Suspense } from 'react';
import { PageSpinner } from '@/components/ui/Spinner';

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}
