'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Photo } from '@/components/ui/Photo';
import { api, getErrorMessage } from '@/lib/api';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [post, setPost] = useState<{ title: string; content: string; coverImage: string; author: string; readMinutes: number } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    setPost(null);
    api
      .get(`/blog/${encodeURIComponent(slug)}`)
      .then((r) => setPost(r.data.data))
      .catch((err) => {
        const msg = getErrorMessage(err);
        if (msg.toLowerCase().includes('not found')) setNotFound(true);
        else {
          setLoadError(true);
          toast(msg, 'error');
        }
      })
      .finally(() => setLoading(false));
  }, [slug, toast]);

  if (loading) return <PageSpinner />;

  if (loadError) {
    return (
      <div className="section-pad mx-auto max-w-lg text-center">
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Could not load article</h1>
        <p className="mt-2 text-slate-muted">The server had trouble loading this guide. Restart the API server and try again.</p>
        <Link href="/blog" className="mt-6 inline-block">
          <Button variant="coral">Back to travel guides</Button>
        </Link>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="section-pad mx-auto max-w-lg text-center">
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Article not found</h1>
        <p className="mt-2 text-slate-muted">This guide may have been removed or the link is incorrect.</p>
        <Link href="/blog" className="mt-6 inline-block">
          <Button variant="coral">Back to travel guides</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="section-pad mx-auto max-w-3xl">
      <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
        <Photo src={post.coverImage || '/images/bd/coxs-bazar.jpg'} alt="" fill sizes="(max-width: 768px) 100vw, 768px" />
      </div>
      <h1 className="font-display text-4xl font-semibold text-navy dark:text-white">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-muted">
        {post.author} · {post.readMinutes} min read
      </p>
      <div className="prose prose-slate mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
