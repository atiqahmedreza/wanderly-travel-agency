'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Photo } from '@/components/ui/Photo';
import { api, getErrorMessage } from '@/lib/api';
import { PageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/contexts/ToastContext';

type Post = { _id: string; title: string; slug: string; excerpt: string; coverImage: string; readMinutes: number; author: string };

export default function BlogPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/blog')
      .then((r) => setPosts(r.data.data))
      .catch((err) => toast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <PageSpinner />;

  return (
    <div className="section-pad mx-auto max-w-7xl">
      <h1 className="font-display text-4xl font-semibold text-navy dark:text-white">Travel guides</h1>
      <p className="mt-2 text-slate-muted">Practical advice from Wanderly trip leaders.</p>
      {posts.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-muted dark:border-slate-700">
          No articles yet. Restart the API server to seed blog posts, or run <code className="text-sm">npm run seed</code> in the{' '}
          <code className="text-sm">server</code> folder.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="relative aspect-video">
                <Photo src={post.coverImage || '/images/bd/coxs-bazar.jpg'} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl text-navy dark:text-white">{post.title}</h2>
                <p className="mt-2 text-sm text-slate-muted line-clamp-3">{post.excerpt}</p>
                <p className="mt-3 text-xs text-slate-muted">
                  {post.author} · {post.readMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
