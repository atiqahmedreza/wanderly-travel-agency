import { cn } from '@/lib/utils';

export function Toast({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  const styles = {
    success: 'border-ocean/30 bg-white text-navy dark:bg-slate-900',
    error: 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
    info: 'border-slate-200 bg-white text-navy dark:bg-slate-900',
  };
  return (
    <div className={cn('min-w-[240px] rounded-xl border px-4 py-3 text-sm shadow-lg', styles[type])} role="status">
      {message}
    </div>
  );
}
