'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';
import Header from '@/app/components/Header';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    bio?: string;
  };
  publishedAt: string;
  readTime: number;
  views: number;
  tags: string[];
  featured: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
      
      if (!res.ok) {
        throw new Error('Post not found');
      }
      
      const data = await res.json();
      setPost(data.post);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      setError('Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link 
            href="/blog"
            className="inline-block px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />

      {/* Hero Section with Cover Image */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container mx-auto">
            <div className="inline-block bg-brand-gold text-gray-900 px-3 py-1 rounded-full text-sm font-bold mb-4">
              {post.category}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading text-white mb-4 max-w-4xl">
              {post.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full border-2 border-brand-gold"
                />
                <div>
                  <p className="font-medium text-white">{post.author.name}</p>
                  <p className="text-sm text-gray-400">{formatDate(post.publishedAt)}</p>
                </div>
              </div>
              <span className="text-gray-400">•</span>
              <span>{post.readTime} min read</span>
              <span className="text-gray-400">•</span>
              <span>{post.views.toLocaleString()} views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content - UPDATED WITH BETTER COLORS */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Content with white/light text */}
        <div 
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-heading prose-headings:text-white prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-white
            prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-100
            prose-p:text-white prose-p:leading-relaxed prose-p:text-lg prose-p:mb-4
            prose-a:text-brand-gold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:text-white prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4
            prose-li:text-white prose-li:mb-2 prose-li:text-lg
            prose-img:rounded-lg prose-img:shadow-xl prose-img:my-8
            prose-blockquote:border-l-4 prose-blockquote:border-brand-gold 
            prose-blockquote:bg-gray-800 prose-blockquote:p-6 prose-blockquote:rounded-r-lg
            prose-blockquote:text-gray-100 prose-blockquote:italic prose-blockquote:text-xl
            prose-blockquote:my-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="text-white font-semibold mb-4 text-xl">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-gray-800 text-gray-200 rounded-full text-sm hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {post.author.bio && (
          <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-start gap-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-20 h-20 rounded-full border-2 border-brand-gold"
              />
              <div>
                <h3 className="text-xl font-heading text-white mb-2">About {post.author.name}</h3>
                <p className="text-gray-300 leading-relaxed">{post.author.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-gray-900 font-semibold rounded-md hover:bg-brand-gold-antique transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </article>
    </main>
  );
}