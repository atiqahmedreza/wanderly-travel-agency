'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, TourPackage, getErrorMessage } from '@/lib/api';
import { TourCard } from '@/components/tours/TourCard';
import { TourCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/contexts/ToastContext';

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<{ _id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    destination: searchParams.get('destination') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    minRating: '',
    travelDate: searchParams.get('travelDate') || '',
    sort: 'newest',
    page: 1,
  });

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/packages', { params: { ...filters, limit: 10 } });
      setPackages(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api.get('/destinations').then((r) => setDestinations(r.data.data));
    api.get('/categories').then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <div className="section-pad mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-navy dark:text-white">Explore tours</h1>
        <p className="mt-2 text-slate-muted">Filter by destination, budget, duration, and rating.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <Input label="Search" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          <div>
            <label htmlFor="destination" className="mb-2 block text-sm font-medium">
              Destination
            </label>
            <select
              id="destination"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value, page: 1 })}
            >
              <option value="">All</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Min price" type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value, page: 1 })} />
            <Input label="Max price" type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value, page: 1 })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Min days" type="number" value={filters.minDuration} onChange={(e) => setFilters({ ...filters, minDuration: e.target.value, page: 1 })} />
            <Input label="Max days" type="number" value={filters.maxDuration} onChange={(e) => setFilters({ ...filters, maxDuration: e.target.value, page: 1 })} />
          </div>
          <Input label="Min rating" type="number" min={1} max={5} step={0.5} value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value, page: 1 })} />
          <Input label="Travel date" type="date" value={filters.travelDate} onChange={(e) => setFilters({ ...filters, travelDate: e.target.value, page: 1 })} />
          <div>
            <label htmlFor="sort" className="mb-2 block text-sm font-medium">
              Sort
            </label>
            <select
              id="sort"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
          <Button className="w-full" onClick={fetchPackages}>
            Apply filters
          </Button>
        </aside>

        <div>
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              <Button variant="outline" className="mt-3" onClick={fetchPackages}>
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <p className="font-display text-xl text-navy dark:text-white">No packages match your filters</p>
              <p className="mt-2 text-sm text-slate-muted">Try widening your price range or clearing the destination filter.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <TourCard key={pkg._id} pkg={pkg} />
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
                  Previous
                </Button>
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === filters.page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setFilters({ ...filters, page })}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
