'use client';

import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

const nav = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/users', label: 'Manage Users' },
  { href: '/dashboard/admin/packages', label: 'Manage Packages' },
  { href: '/dashboard/admin/bookings', label: 'Manage Bookings' },
  { href: '/dashboard/admin/destinations', label: 'Destinations & Categories' },
  { href: '/dashboard/admin/reports', label: 'Reports' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

type UserRow = { _id: string; name: string; email: string; role: string };

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);

  const load = () => api.get('/admin/users').then((r) => setUsers(r.data.data)).catch((err) => toast(getErrorMessage(err), 'error'));
  useEffect(() => {
    load();
  }, [toast]);

  const toggleRole = async (user: UserRow) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { role: user.role === 'admin' ? 'user' : 'admin' });
      toast('Role updated', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast('User deleted', 'success');
      load();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <DashboardShell role="admin" items={nav}>
      <h1 className="font-display text-3xl font-semibold">Manage users</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleRole(u)}>
                      Toggle role
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(u._id)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
