'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Compass, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export function Footer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      const res = await api.post('/newsletter', data);
      toast(res.data.message, 'success');
      reset();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-navy text-slate-200 dark:border-slate-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl text-white">
            <Compass className="h-6 w-6 text-ocean-light" />
            Wanderly
          </Link>
          <p className="text-sm text-slate-400">Curated journeys across Bangladesh and the world — booked with confidence.</p>
          <div className="flex gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 hover:bg-white/10" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 hover:bg-white/10" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 hover:bg-white/10" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 hover:bg-white/10" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg text-white">Quick links</h3>
          <ul className="space-y-2 text-sm">
            {[
              ['About', '/about'],
              ['Contact', '/contact'],
              ['Blog', '/blog'],
              ['Privacy Policy', '/privacy'],
              ['Terms & Conditions', '/terms'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-ocean-light">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg text-white">Contact</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>House 12, Road 5, Gulshan-2, Dhaka 1212</li>
            <li>
              <a href="tel:+8809612345678" className="hover:text-white">
                +880 9612 345 678
              </a>
            </li>
            <li>
              <a href="mailto:hello@wanderly.com" className="hover:text-white">
                hello@wanderly.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg text-white">Newsletter</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
              className="border-slate-700 bg-slate-900 text-white"
            />
            <Button type="submit" variant="coral" loading={loading} className="w-full">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Wanderly Travel Agency. All rights reserved.
      </div>
    </footer>
  );
}
