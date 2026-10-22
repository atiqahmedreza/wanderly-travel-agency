'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Compass, Menu, Moon, Sun, X, ChevronDown, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DEFAULT_AVATAR } from '@/lib/stockImages';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'About' },
];

const authedLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/dashboard/user', label: 'Dashboard' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user ? authedLinks : [...publicLinks, { href: '/login', label: 'Login' }];
  const dashHref = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-navy/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-navy dark:text-white">
          <Compass className="h-7 w-7 text-ocean" />
          Wanderly
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {(user ? authedLinks : publicLinks).map((link) => (
            <Link
              key={link.href}
              href={link.href === '/dashboard/user' && user ? dashHref : link.href}
              className={cn(
                'text-sm font-medium transition',
                isActive(link.href) ? 'text-ocean' : 'text-slate-600 hover:text-navy dark:text-slate-300 dark:hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link href="/login" className={cn('text-sm font-medium', isActive('/login') && 'text-ocean')}>
              Login
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {!loading && !user && (
            <Link href="/register" className="hidden sm:block">
              <Button variant="coral" size="sm">
                Register
              </Button>
            </Link>
          )}

          {user && (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 dark:border-slate-700"
              >
                <img src={user.avatar || DEFAULT_AVATAR} alt="" className="h-8 w-8 rounded-xl object-cover" />
                <span className="max-w-[100px] truncate text-sm font-medium">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                    <p className="text-sm font-medium">{user.name}</p>
                    <Badge variant={user.role === 'admin' ? 'admin' : 'ocean'} className="mt-1 capitalize">
                      {user.role}
                    </Badge>
                  </div>
                  <Link href={dashHref} className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                    My Dashboard
                  </Link>
                  <Link href="/dashboard/user/bookings" className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                    My Bookings
                  </Link>
                  <Link href="/dashboard/user/wishlist" className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <Link href="/dashboard/user/profile" className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMenuOpen(false)}>
                    Profile Settings
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button type="button" className="rounded-xl p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href === '/dashboard/user' && user ? dashHref : link.href}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button variant="coral" className="w-full">
                  Register
                </Button>
              </Link>
            )}
            {user && (
              <Button variant="outline" className="w-full" onClick={() => { logout(); setOpen(false); }}>
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
