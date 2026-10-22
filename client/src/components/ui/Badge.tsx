import { cn } from '@/lib/utils';

export function Badge({
  children,
  className,
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'ocean' | 'coral' | 'admin';
}) {
  const styles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    ocean: 'bg-ocean/10 text-ocean-dark dark:text-ocean-light',
    coral: 'bg-coral/10 text-coral-dark',
    admin: 'bg-navy text-white dark:bg-ocean-dark',
  };
  return (
    <span className={cn('inline-flex rounded-xl px-2.5 py-1 text-xs font-medium', styles[variant], className)}>
      {children}
    </span>
  );
}
