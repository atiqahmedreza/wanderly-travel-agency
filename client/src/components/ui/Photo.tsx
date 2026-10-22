import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/** Full-quality image — no opacity or filter dimming */
export function Photo({ className, quality = 100, ...props }: ImageProps) {
  return <Image {...props} quality={quality} className={cn('object-cover', className)} />;
}
