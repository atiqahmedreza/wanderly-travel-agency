'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getErrorMessage } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please include more detail'),
});

export default function ContactPage() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await api.post('/contact', data);
      toast('Message sent — we will reply within one business day.', 'success');
      reset();
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="section-pad mx-auto max-w-7xl">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-semibold text-navy dark:text-white">Contact us</h1>
          <p className="mt-3 text-slate-muted">Questions about a package, group booking, or partnership? Send a message.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>House 12, Road 5, Gulshan-2, Dhaka 1212</li>
            <li>+880 9612 345 678</li>
            <li>hello@wanderly.com</li>
            <li>Sunday–Thursday, 9:00–18:00 BST</li>
          </ul>
          <iframe
            title="Wanderly office map"
            className="mt-8 h-64 w-full rounded-xl border-0"
            loading="lazy"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.0!2d90.4152!3d23.7925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ3JzMzLjAiTiA5MMKwMjQnNTQuNyJF!5e0!3m2!1sen!2sbd!4v1"
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <div className="mt-4">
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="mt-4">
            <Input label="Subject" error={errors.subject?.message} {...register('subject')} />
          </div>
          <div className="mt-4">
            <label htmlFor="message" className="mb-2 block text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              {...register('message')}
            />
            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
          </div>
          <Button type="submit" className="mt-6 w-full" loading={isSubmitting}>
            Send message
          </Button>
        </form>
      </div>
    </div>
  );
}
