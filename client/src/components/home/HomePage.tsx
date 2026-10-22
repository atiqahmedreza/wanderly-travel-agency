'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Photo } from '@/components/ui/Photo';
import { motion } from 'framer-motion';
import { api, TourPackage, getErrorMessage } from '@/lib/api';
import { TourCard } from '@/components/tours/TourCard';
import { TourCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { useToast } from '@/contexts/ToastContext';
import { HERO_IMAGES } from '@/lib/stockImages';

type Stats = {
  tripsBooked: number;
  destinations: number;
  happyTravelers: number;
  averageRating: number;
  heroDestinations: { _id: string; name: string; slug: string; image: string }[];
};

export function HomePage() {
  const { toast } = useToast();
  const [featured, setFeatured] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<{ _id: string; name: string; slug: string; image: string; description: string }[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string; description: string }[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [whyUs, setWhyUs] = useState<{ label: string; value: number; suffix: string }[]>([]);
  const [testimonials, setTestimonials] = useState<
    { _id: string; rating: number; comment: string; user: { name: string; avatar?: string }; package: { title: string; location: string } }[]
  >([]);
  const [blog, setBlog] = useState<{ _id: string; title: string; slug: string; excerpt: string; coverImage: string; readMinutes: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    (async () => {
      const results = await Promise.allSettled([
        api.get('/packages/featured'),
        api.get('/destinations'),
        api.get('/categories'),
        api.get('/stats/public'),
        api.get('/stats/why-us'),
        api.get('/reviews/testimonials'),
        api.get('/blog/latest'),
      ]);
      const failures: string[] = [];
      const pick = <T,>(i: number, setter: (v: T) => void) => {
        const r = results[i];
        if (r.status === 'fulfilled') setter(r.value.data.data);
        else failures.push(getErrorMessage(r.reason));
      };
      pick(0, setFeatured);
      pick(1, setDestinations);
      pick(2, setCategories);
      pick(3, setStats);
      pick(4, setWhyUs);
      pick(5, setTestimonials);
      pick(6, setBlog);
      if (failures.length) toast(failures[0], 'error');
      setLoading(false);
    })();
  }, [toast]);

  // Always use verified hero URLs (API may still serve legacy broken Unsplash links)
  const heroSlides = HERO_IMAGES;

  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const faqs = [
    { q: 'How do I pay for a tour?', a: 'After filling the booking form, you are redirected to Stripe Checkout for secure USD payment. Your booking confirms instantly once paid.' },
    { q: 'Can I cancel a booking?', a: 'Yes — pending and confirmed bookings can be cancelled from My Bookings unless the trip is marked completed.' },
    { q: 'Who can leave a review?', a: 'Only travelers with a completed booking for that package can post a verified review.' },
    { q: 'Which destinations do you cover?', a: 'Wanderly specializes in Bangladesh — from Cox’s Bazar and Saint Martin’s Island to the Sundarbans, Sylhet, Bandarban, Kuakata, Rangamati, and Dhaka.' },
  ];

  const heroImage = heroSlides[heroIndex % heroSlides.length];

  return (
    <>
      <section className="relative min-h-[65vh] overflow-hidden bg-navy text-white">
        <div className="absolute inset-0">
          <Photo
            src={heroImage}
            alt="Scenic travel destination — sea and green landscapes"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-navy/40" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/25 to-navy/40" />
        </div>
        <div className="relative mx-auto flex min-h-[65vh] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-200 [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
              Premium travel agency
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.75),0_1px_3px_rgba(0,0,0,0.9)] sm:text-5xl">
              Your Next Journey Starts Here
            </h1>
            <p className="mt-4 text-lg font-medium leading-relaxed text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.8),0_1px_2px_rgba(0,0,0,0.85)]">
              Compare curated tours, read verified reviews, and book with secure payments across Bangladesh.
            </p>
            <div className="mt-8 flex flex-col items-center gap-5">
              <Link href="/explore">
                <Button variant="coral" size="lg">
                  Explore Tours
                </Button>
              </Link>
              {stats && (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
                  <span>{stats.tripsBooked}+ trips booked</span>
                  <span>{stats.destinations} destinations</span>
                  <span>{stats.averageRating}★ avg rating</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">Featured tour packages</h2>
            <p className="mt-2 text-slate-muted">Handpicked departures with top ratings and fresh itineraries.</p>
          </div>
          <Link href="/explore" className="hidden text-sm font-medium text-ocean sm:block">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <TourCardSkeleton key={i} />)
            : featured.map((pkg, i) => (
                <motion.div key={pkg._id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <TourCard pkg={pkg} />
                </motion.div>
              ))}
        </div>
      </section>

      <section className="bg-slate-50 section-pad dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">Popular destinations</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 8).map((dest) => (
              <Link
                key={dest._id}
                href={`/explore?destination=${dest._id}`}
                className="group relative overflow-hidden rounded-xl"
              >
                <div className="relative aspect-[4/3]">
                  <Photo src={dest.image} alt={dest.name} fill className="transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <div className="absolute bottom-0 p-4 text-white">
                    <h3 className="font-display text-xl">{dest.name}</h3>
                    <p className="mt-1 text-xs text-slate-200 line-clamp-2">{dest.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">Travel categories</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/explore?category=${cat._id}`}
              className="rounded-xl border border-slate-200 p-6 transition hover:border-ocean hover:shadow-card dark:border-slate-800"
            >
              <h3 className="font-display text-xl text-navy dark:text-white">{cat.name}</h3>
              <p className="mt-2 text-sm text-slate-muted">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-navy section-pad text-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl font-semibold">Why choose Wanderly</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => (
              <div key={item.label} className="rounded-xl bg-white/5 p-6">
                <p className="text-3xl font-semibold text-ocean-light">
                  {item.value}
                  {item.suffix}
                </p>
                <p className="mt-2 text-sm text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {['Choose your tour', 'Book your dates', 'Pay securely', 'Travel with confidence'].map((step, i) => (
            <div key={step} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <span className="text-sm font-semibold text-coral">Step {i + 1}</span>
              <p className="mt-2 font-display text-xl text-navy dark:text-white">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {stats && (
        <section className="bg-ocean/5 section-pad">
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Trips booked', value: stats.tripsBooked },
              { label: 'Destinations', value: stats.destinations },
              { label: 'Happy travelers', value: stats.happyTravelers },
              { label: 'Average rating', value: stats.averageRating },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white p-6 text-center shadow-card dark:bg-slate-900">
                <p className="text-3xl font-semibold text-ocean">{s.value}</p>
                <p className="mt-1 text-sm text-slate-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section-pad mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">Traveler testimonials</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t._id} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <Rating value={t.rating} />
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">&ldquo;{t.comment}&rdquo;</p>
              <p className="mt-4 text-sm font-medium">{t.user.name}</p>
              <p className="text-xs text-slate-muted">{t.package.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 section-pad dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">Travel guides</h2>
            <Link href="/blog" className="text-sm font-medium text-ocean">
              View all
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {blog.length === 0 && !loading ? (
              <p className="text-slate-muted md:col-span-3">Travel guides are loading soon. Check back or visit the Blog page.</p>
            ) : null}
            {blog.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-xl bg-white shadow-card dark:bg-slate-900">
                <div className="relative aspect-video">
                  <Photo src={post.coverImage || '/images/bd/coxs-bazar.jpg'} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-navy dark:text-white">{post.title}</h3>
                  <p className="mt-2 text-sm text-slate-muted line-clamp-2">{post.excerpt}</p>
                  <p className="mt-3 text-xs text-slate-muted">{post.readMinutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-semibold text-navy dark:text-white">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded-xl border border-slate-200 dark:border-slate-800">
              <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left font-medium" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-muted dark:border-slate-800">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad mx-auto max-w-7xl">
        <div className="rounded-xl bg-gradient-to-r from-ocean to-ocean-dark p-8 text-white md:p-12">
          <h2 className="font-display text-3xl font-semibold">Ready for your next chapter?</h2>
          <p className="mt-2 max-w-xl text-slate-100">Join thousands of travelers who book smarter with Wanderly.</p>
          <form
            className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await api.post('/newsletter', { email: newsletterEmail });
                toast(res.data.message, 'success');
                setNewsletterEmail('');
              } catch (err) {
                toast(getErrorMessage(err), 'error');
              }
            }}
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Email for deals"
              className="h-11 flex-1 rounded-xl px-4 text-navy"
            />
            <Button type="submit" variant="coral">
              Subscribe
            </Button>
          </form>
          <Link href="/explore" className="mt-4 inline-block">
            <Button variant="outline" className="border-white text-white hover:bg-white/10">
              Browse all tours
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
