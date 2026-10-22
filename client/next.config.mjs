/** @type {import('next').NextConfig} */
const PRODUCTION_API = 'https://wanderly-travel-agency.onrender.com/api';

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Render free tier: skip on-the-fly image optimization (502s + broken thumbnails).
  images: {
    unoptimized: Boolean(process.env.RENDER),
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'i.ibb.co' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [256, 384, 640, 750, 828, 1080, 1200, 1920],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.RENDER || process.env.NODE_ENV === 'production'
        ? PRODUCTION_API
        : 'http://localhost:5000/api'),
  },
};

export default nextConfig;
