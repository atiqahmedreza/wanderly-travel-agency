'use client';

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

const schema = z
  .object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email required'),
    password: z
      .string()
      .min(8, 'Min 8 characters')
      .regex(/[a-z]/, 'Include lowercase')
      .regex(/[A-Z]/, 'Include uppercase')
      .regex(/\d/, 'Include a number')
      .regex(/[^A-Za-z0-9]/, 'Include a special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await registerUser(data);
      toast('Account created successfully', 'success');
      router.push('/dashboard/user');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="section-pad mx-auto flex max-w-md flex-col">
      <h1 className="font-display text-3xl font-semibold text-navy dark:text-white">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input label="Full name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" variant="coral" className="w-full" loading={isSubmitting}>
          Register
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-ocean hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
