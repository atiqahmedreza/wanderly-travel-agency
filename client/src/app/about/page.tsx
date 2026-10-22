import { Photo } from '@/components/ui/Photo';
import Image from 'next/image';
import { ABOUT_HERO } from '@/lib/stockImages';

const team = [
  { name: 'Amira Chowdhury', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' },
  { name: 'Tanvir Haque', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400' },
  { name: 'Leila Karim', role: 'Experience Design', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400' },
];

export default function AboutPage() {
  return (
    <div className="section-pad mx-auto max-w-7xl">
      <h1 className="font-display text-4xl font-semibold text-navy dark:text-white">About Wanderly</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-muted">
        Wanderly was founded in Dhaka with a simple belief: travelers deserve honest itineraries, transparent pricing, and human support from first click to final flight home.
      </p>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Our mission</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            We connect Bangladeshi travelers to domestic gems and global destinations through curated packages, verified reviews, and secure online booking.
          </p>
          <h2 className="mt-8 font-display text-2xl font-semibold">Our story</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            After years operating boutique group tours, our founders built Wanderly to scale what worked: small groups, local guides, and photography-first trip design — without sacrificing personal care.
          </p>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-xl">
          <Photo src={ABOUT_HERO} alt="Sunrise over a calm turquoise sea" fill sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">Values</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Transparency in pricing', 'Safety-first departures', 'Community-positive tourism'].map((v) => (
            <div key={v} className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <p className="font-medium text-ocean">{v}</p>
              <p className="mt-2 text-sm text-slate-muted">Embedded in every package we publish and every partner we onboard.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">Team</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {team.map((m) => (
            <div key={m.name} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-xl">
                <Photo src={m.image} alt={m.name} fill sizes="128px" />
              </div>
              <p className="mt-4 text-center font-medium">{m.name}</p>
              <p className="text-center text-sm text-slate-muted">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-xl bg-slate-50 p-8 dark:bg-slate-900">
        <h2 className="font-display text-2xl font-semibold">Certifications & partners</h2>
        <p className="mt-3 text-sm text-slate-muted">
          Registered with the Bangladesh Tour Operators Association · IATA-aligned ticketing partners · Stripe Verified Business · Sustainable Tourism Pledge signatory
        </p>
      </section>
    </div>
  );
}
