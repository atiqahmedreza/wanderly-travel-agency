import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const icon = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(icon, i < Math.round(value) ? 'fill-coral text-coral' : 'text-slate-300 dark:text-slate-600')}
        />
      ))}
      <span className="ml-1 text-sm text-slate-muted">{value.toFixed(1)}</span>
    </div>
  );
}
