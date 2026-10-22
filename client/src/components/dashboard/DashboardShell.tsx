'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RouteGuard } from '@/components/auth/RouteGuard';

export function DashboardShell({
  role,
  items,
  children,
}: {
  role: 'user' | 'admin';
  items: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <RouteGuard roles={[role]}>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" className="fixed bottom-4 right-4 z-30 rounded-xl bg-ocean p-3 text-white lg:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-20 w-64 transform border-r border-slate-200 bg-white p-4 transition dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 lg:rounded-xl lg:border',
            open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <p className="mb-4 font-display text-lg font-semibold capitalize">{role} dashboard</p>
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium',
                  pathname === item.href ? 'bg-ocean/10 text-ocean' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </RouteGuard>
  );
}
