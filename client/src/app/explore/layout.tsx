import { Suspense } from 'react';
import { PageSpinner } from '@/components/ui/Spinner';

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}
