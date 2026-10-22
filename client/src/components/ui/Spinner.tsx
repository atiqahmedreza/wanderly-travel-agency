import { Loader2 } from 'lucide-react';

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-ocean" aria-label="Loading" />
      <p className="text-sm text-slate-muted">Loading Wanderly…</p>
    </div>
  );
}
