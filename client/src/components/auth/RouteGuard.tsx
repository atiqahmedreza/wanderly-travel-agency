'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

export function RouteGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<'user' | 'admin'>;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    }
  }, [user, loading, roles, router]);

  if (loading) return <PageSpinner />;
  if (!user) return <PageSpinner />;
  if (roles && !roles.includes(user.role)) return <PageSpinner />;

  return <>{children}</>;
}
