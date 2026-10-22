'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

const nav = [
  { href: '/dashboard/user', label: 'Overview' },
  { href: '/dashboard/user/bookings', label: 'My Bookings' },
  { href: '/dashboard/user/wishlist', label: 'Wishlist' },
  { href: '/dashboard/user/profile', label: 'Profile & Settings' },
];

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().max(500).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState('');
  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, phone: user.phone || '', bio: user.bio || '' });
      setAvatarPreview(user.avatar || '');
    }
  }, [user, profileForm]);

  const onProfile = async (data: z.infer<typeof profileSchema>) => {
    try {
      await api.patch('/auth/profile', { ...data, avatarBase64: avatarPreview.startsWith('data:') ? avatarPreview : undefined });
      await refreshUser();
      toast('Profile updated', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const onPassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await api.patch('/auth/password', data);
      toast('Password changed', 'success');
      passwordForm.reset();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <DashboardShell role="user" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Profile & settings</h1>
      <form onSubmit={profileForm.handleSubmit(onProfile)} className="mt-8 max-w-lg space-y-4">
        <div>
          <label htmlFor="avatar" className="text-sm font-medium">
            Profile photo
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setAvatarPreview(reader.result as string);
              reader.readAsDataURL(file);
            }}
          />
          {avatarPreview && <img src={avatarPreview} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover" />}
        </div>
        <Input label="Full name" error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
        <Input label="Phone" {...profileForm.register('phone')} />
        <Input label="Bio" {...profileForm.register('bio')} />
        <Button type="submit" loading={profileForm.formState.isSubmitting}>
          Save profile
        </Button>
      </form>

      <form onSubmit={passwordForm.handleSubmit(onPassword)} className="mt-12 max-w-lg space-y-4">
        <h2 className="font-display text-xl font-semibold">Change password</h2>
        <Input label="Current password" type="password" {...passwordForm.register('currentPassword')} />
        <Input label="New password" type="password" error={passwordForm.formState.errors.password?.message} {...passwordForm.register('password')} />
        <Input label="Confirm password" type="password" error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
        <Button type="submit" variant="outline" loading={passwordForm.formState.isSubmitting}>
          Update password
        </Button>
      </form>
    </DashboardShell>
  );
}
