'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    }
  }, [authLoading, user, router]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const u = await login(data.email, data.password);
      toast('Welcome back!', 'success');
      router.push(u.role === 'admin' ? '/dashboard/admin' : '/dashboard/user');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="section-pad mx-auto flex max-w-md flex-col">
      <h1 className="font-display text-3xl font-semibold text-navy dark:text-white">Log in</h1>
      <p className="mt-2 text-sm text-slate-muted">Access your bookings, wishlist, and profile.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>
      <div className="mt-6 grid gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValue('email', 'maya.rahman@email.com');
            setValue('password', 'Travel@123');
          }}
        >
          Demo Login (Traveler)
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setValue('email', 'admin@wanderly.com');
            setValue('password', 'Admin@123');
          }}
        >
          Demo Login (Admin)
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-slate-muted">
        New to Wanderly?{' '}
        <Link href="/register" className="text-ocean hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
