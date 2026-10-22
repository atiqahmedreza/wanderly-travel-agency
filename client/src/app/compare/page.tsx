'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, TourPackage, getErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';

export default function ComparePage() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [items, setItems] = useState<TourPackage[]>([]);

  useEffect(() => {
    const ids = params.get('ids')?.split(',').filter(Boolean).slice(0, 3) || [];
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => api.get(`/packages/${id}`).then((r) => r.data.data)))
      .then(setItems)
      .catch((err) => toast(getErrorMessage(err), 'error'));
  }, [params, toast]);

  return (
    <div className="section-pad mx-auto max-w-7xl">
      <h1 className="font-display text-3xl font-semibold">Compare packages</h1>
      <p className="mt-2 text-sm text-slate-muted">Add up to three package IDs via ?ids=id1,id2,id3</p>
      {items.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Field</th>
                {items.map((p) => (
                  <th key={p._id} className="px-3 py-2 text-left">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  { label: 'Price', fn: (p: TourPackage) => formatCurrency(p.price) },
                  { label: 'Duration', fn: (p: TourPackage) => `${p.durationDays} days` },
                  { label: 'Rating', fn: (p: TourPackage) => String(p.averageRating) },
                  { label: 'Location', fn: (p: TourPackage) => p.location },
                  { label: 'Difficulty', fn: (p: TourPackage) => p.difficulty || '—' },
                ] as const
              ).map((row) => (
                <tr key={row.label} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-3 py-2 font-medium">{row.label}</td>
                  {items.map((p) => (
                    <td key={p._id} className="px-3 py-2">
                      {row.fn(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
