'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="section-pad mx-auto max-w-md text-center">
      <h2 className="font-display text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-slate-muted">Reload the page or try again in a moment.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-ocean px-5 py-2.5 text-sm font-medium text-white"
      >
        Reload
      </button>
    </div>
  );
}
