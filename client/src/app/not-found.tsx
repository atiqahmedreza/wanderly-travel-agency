import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="section-pad mx-auto flex max-w-lg flex-col items-center text-center">
      <MapPinOff className="h-16 w-16 text-ocean" />
      <h1 className="mt-6 font-display text-4xl font-semibold text-navy dark:text-white">Route not on the map</h1>
      <p className="mt-3 text-slate-muted">The page you are looking for may have moved or never existed.</p>
      <Link href="/" className="mt-8">
        <Button variant="coral">Go Home</Button>
      </Link>
    </div>
  );
}
