'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Photo } from '@/components/ui/Photo';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, X } from 'lucide-react';
import { api, TourPackage, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { PageSpinner } from '@/components/ui/Spinner';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TourCard } from '@/components/tours/TourCard';
import { formatCurrency } from '@/lib/utils';
import { DEFAULT_AVATAR } from '@/lib/stockImages';

const bookingSchema = z.object({
  travelDate: z.string().min(1, 'Travel date is required'),
  travelers: z.coerce.number().min(1).max(20),
  contactName: z.string().min(2, 'Name is required'),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().optional(),
});

export default function PackageDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [related, setRelated] = useState<TourPackage[]>([]);
  const [reviews, setReviews] = useState<{ _id: string; rating: number; comment: string; user: { name: string; avatar?: string } }[]>([]);
  const [breakdown, setBreakdown] = useState<{ star: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [openDay, setOpenDay] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { travelers: 2, contactName: user?.name || '', contactEmail: user?.email || '' },
  });

  const travelers = form.watch('travelers') || 1;
  const total = useMemo(() => (pkg ? pkg.price * travelers : 0), [pkg, travelers]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data } = await api.get(`/packages/${slug}`);
        setPkg(data.data);
        const [rel, rev] = await Promise.all([
          api.get(`/packages/${data.data._id}/related`),
          api.get(`/reviews/package/${data.data._id}`),
        ]);
        setRelated(rel.data.data);
        setReviews(rev.data.data);
        setBreakdown(rev.data.breakdown);
      } catch (err) {
        if (getErrorMessage(err).includes('not found')) setNotFound(true);
        else toast(getErrorMessage(err), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, toast]);

  useEffect(() => {
    if (user && pkg) {
      api.get('/wishlist').then((r) => {
        setWishlisted(r.data.data.some((p: TourPackage) => p._id === pkg._id));
      }).catch(() => {});
    }
  }, [user, pkg]);

  useEffect(() => {
    if (user) {
      form.setValue('contactName', user.name);
      form.setValue('contactEmail', user.email);
    }
  }, [user, form]);

  const onBook = () => {
    if (!user) {
      toast('Please log in to book this tour', 'info');
      router.push('/login');
      return;
    }
    setBookOpen(true);
  };

  const submitBooking = async (values: z.infer<typeof bookingSchema>) => {
    if (!pkg) return;
    setBookingLoading(true);
    try {
      const { data } = await api.post('/bookings/checkout', { ...values, packageId: pkg._id });
      window.location.href = data.url;
    } catch (err) {
      toast(getErrorMessage(err), 'error');
      setBookingLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const { data } = await api.post(`/wishlist/${pkg?._id}`);
      setWishlisted(data.added);
      toast(data.added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
    } catch (err) {
      toast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <PageSpinner />;
  if (notFound || !pkg) {
    return (
      <div className="section-pad mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-semibold">Package not found</h1>
        <Link href="/explore" className="mt-6 inline-block">
          <Button>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="section-pad mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <button type="button" className="relative aspect-[4/3] w-full overflow-hidden rounded-xl" onClick={() => setLightbox(true)}>
            <Photo src={pkg.images[galleryIndex]} alt={pkg.title} fill sizes="(max-width: 1024px) 100vw, 50vw" />
          </button>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {pkg.images.map((img, i) => (
              <button key={img} type="button" onClick={() => setGalleryIndex(i)} className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${i === galleryIndex ? 'border-ocean' : 'border-transparent'}`}>
                <Photo src={img} alt="" fill sizes="112px" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ocean">{pkg.category?.name} · {pkg.destination?.name}</p>
              <h1 className="mt-2 font-display text-4xl font-semibold text-navy dark:text-white">{pkg.title}</h1>
              <Rating value={pkg.averageRating} size="md" />
            </div>
            <button type="button" onClick={toggleWishlist} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700" aria-label="Wishlist">
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-coral text-coral' : ''}`} />
            </button>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">{pkg.description}</p>
          <p className="mt-6 text-2xl font-semibold text-ocean">{formatCurrency(pkg.price)} <span className="text-sm font-normal text-slate-muted">per person</span></p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="coral" size="lg" onClick={onBook}>
              Book Now
            </Button>
            <Link href="/explore">
              <Button variant="outline">Compare more tours</Button>
            </Link>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-muted">Duration</dt><dd className="font-medium">{pkg.durationDays} days</dd></div>
            <div><dt className="text-slate-muted">Group size</dt><dd className="font-medium">{pkg.groupSize}</dd></div>
            <div><dt className="text-slate-muted">Difficulty</dt><dd className="font-medium">{pkg.difficulty}</dd></div>
            <div><dt className="text-slate-muted">Departure</dt><dd className="font-medium">{pkg.departureCity}</dd></div>
            <div className="col-span-2"><dt className="text-slate-muted">Languages</dt><dd className="font-medium">{pkg.languages?.join(', ')}</dd></div>
          </dl>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Day-by-day itinerary</h2>
        <div className="mt-4 space-y-2">
          {pkg.itinerary?.map((day, i) => (
            <div key={day.day} className="rounded-xl border border-slate-200 dark:border-slate-800">
              <button type="button" className="flex w-full justify-between px-4 py-3 text-left font-medium" onClick={() => setOpenDay(openDay === i ? -1 : i)}>
                Day {day.day}: {day.title}
                <span>{openDay === i ? '−' : '+'}</span>
              </button>
              {openDay === i && <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-muted dark:border-slate-800">{day.description}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-display text-xl font-semibold">Inclusions</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {pkg.inclusions?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Exclusions</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {pkg.exclusions?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      {pkg.mapEmbedUrl && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Location</h2>
          <iframe title="Map" src={pkg.mapEmbedUrl} className="mt-4 h-72 w-full rounded-xl border-0" loading="lazy" />
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Reviews</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-[200px_1fr]">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-3xl font-semibold">{pkg.averageRating.toFixed(1)}</p>
            <p className="text-sm text-slate-muted">{pkg.reviewCount} reviews</p>
            {breakdown.map((b) => (
              <div key={b.star} className="mt-2 flex items-center gap-2 text-xs">
                <span>{b.star}★</span>
                <div className="h-2 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700">
                  <div className="h-2 rounded-xl bg-ocean" style={{ width: `${pkg.reviewCount ? (b.count / pkg.reviewCount) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={r.user.avatar || DEFAULT_AVATAR} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium">{r.user.name}</p>
                    <Rating value={r.rating} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Related packages</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <TourCard key={p._id} pkg={p} />
            ))}
          </div>
        </section>
      )}

      <Modal open={bookOpen} onClose={() => setBookOpen(false)} title="Complete your booking">
        <form onSubmit={form.handleSubmit(submitBooking)} className="space-y-4">
          <Input label="Travel date" type="date" error={form.formState.errors.travelDate?.message} {...form.register('travelDate')} />
          <Input label="Travelers" type="number" min={1} error={form.formState.errors.travelers?.message?.toString()} {...form.register('travelers')} />
          <Input label="Contact name" error={form.formState.errors.contactName?.message} {...form.register('contactName')} />
          <Input label="Contact email" type="email" error={form.formState.errors.contactEmail?.message} {...form.register('contactEmail')} />
          <Input label="Phone" {...form.register('contactPhone')} />
          <p className="text-lg font-semibold text-ocean">Total: {formatCurrency(total)}</p>
          <Button type="submit" variant="coral" className="w-full" loading={bookingLoading}>
            Proceed to Stripe Checkout
          </Button>
        </form>
      </Modal>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4">
          <button type="button" className="absolute right-4 top-4 text-white" onClick={() => setLightbox(false)}>
            <X className="h-8 w-8" />
          </button>
          <div className="relative h-[70vh] w-full max-w-4xl">
            <Image src={pkg.images[galleryIndex]} alt="" fill className="object-contain" quality={100} />
          </div>
        </div>
      )}
    </div>
  );
}
