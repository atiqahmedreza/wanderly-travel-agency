import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(({ className, label, error, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy dark:text-slate-200">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-navy outline-none transition placeholder:text-slate-400 focus:border-ocean focus:ring-2 focus:ring-ocean/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
