import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900',
        className
      )}
    >
      {children}
    </div>
  );
}
