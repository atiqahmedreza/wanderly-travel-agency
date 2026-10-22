import Link from 'next/link';
import { Photo } from '@/components/ui/Photo';
import { MapPin, Clock } from 'lucide-react';
import { TourPackage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';

export function TourCard({ pkg }: { pkg: TourPackage }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo
          src={pkg.images[0]}
          alt={pkg.title}
          fill
          className="transition duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold text-navy line-clamp-2 dark:text-white">{pkg.title}</h3>
        <p className="mt-2 flex-1 text-sm text-slate-muted line-clamp-2">{pkg.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-ocean">{formatCurrency(pkg.price)} / person</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {pkg.durationDays} days
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {pkg.location}
          </span>
        </div>
        <div className="mt-2">
          <Rating value={pkg.averageRating || 0} />
        </div>
        <Link href={`/packages/${pkg.slug}`} className="mt-4">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </article>
  );
}
