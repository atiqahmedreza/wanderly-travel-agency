import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wanderly_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const msg = error.response.data?.message || '';
      if (msg.toLowerCase().includes('session expired')) {
        localStorage.removeItem('wanderly_token');
        window.dispatchEvent(new CustomEvent('wanderly:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  bio?: string;
  wishlist?: TourPackage[];
};

export type TourPackage = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  images: string[];
  price: number;
  durationDays: number;
  location: string;
  averageRating: number;
  reviewCount: number;
  destination?: { _id: string; name: string; slug: string };
  category?: { _id: string; name: string; slug: string };
  groupSize?: string;
  difficulty?: string;
  departureCity?: string;
  languages?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: { day: number; title: string; description: string }[];
  mapEmbedUrl?: string;
};

export function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
