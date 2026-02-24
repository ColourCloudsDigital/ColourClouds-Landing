/**
 * Blog Post Detail Page
 * 
 * Dynamic route for individual blog posts with:
 * - Static generation using generateStaticParams()
 * - Cached data fetching by slug
 * - Full markdown content rendering
 * - 404 handling for non-existent posts
 * - SEO metadata generation
 * 
 * Requirements: 1.5, 4.3, 4.4, 4.6, 4.7
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCachedBlogPosts, getCachedBlogPostBySlug } from '@/lib/cache';
import { findRelatedPosts } from '@/lib/related-posts';
import { RelatedPosts } from '@/components/related-posts';
import { Breadcrumb } from '@/components/breadcrumb';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Image from 'next/image';

/**
 * Generate static params for all blog posts
 * Requirements: 4.4 - Generate dynamic routes for blog post detail pages using the slug field
 * 
 * This function is called at build time to generate static pages for all blog posts.
 * It fetches all published blog posts and returns their slugs for static generation.
 */
export async function generateStaticParams() {
  try {
    const posts = await getCachedBlogPosts();
    
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
    return [];
  }
}

/**
 * Generate metadata for the blog post
 * Requirements: 6.1, 6.6 - Generate metadata from blog post title and excerpt
 * 
 * @param params - Route parameters containing the slug
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await getCachedBlogPostBySlug(slug);
    
    if (!post) {
      return {
        title: 'Post Not Found | Colour Clouds Digital',
        description: 'The requested blog post could not be found.',
      };
    }
    
    return {
      title: `${post.title} | Colour Clouds Digital`,
      description: post.excerpt,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : [],
        type: 'article',
        publishedTime: post.publishedAt,
        authors: [post.author],
        url: `/blog/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for blog post:', error);
    return {
      title: 'Blog Post | Colour Clouds Digital',
      description: 'Read our latest blog post.',
    };
  }
}

/**
 * Blog Post Detail Page Component
 * 
 * Requirements:
 * - 1.5: Provide dynamic blog post detail pages at "/blog/[slug]"
 * - 4.3: Navigate to blog post detail page when clicking on a post
 * - 4.6: Return 404 error page for non-existent posts
 * - 4.7: Support markdown formatting in blog post content
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch blog post by slug with caching
  // Requirement: 4.3 - Fetch blog post by slug with caching
  const post = await getCachedBlogPostBySlug(slug);
  
  // Handle 404 for non-existent posts
  // Requirement: 4.6 - Return 404 error page for non-existent posts
  if (!post) {
    notFound();
  }
  
  // Fetch all posts to find related posts
  // Requirement: 4.8 - Display related posts based on category or tags
  const allPosts = await getCachedBlogPosts();
  const relatedPosts = findRelatedPosts(post, allPosts, 3);
  
  // Format the published date
  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      {/* Requirement: 10.1 - Display breadcrumb navigation showing Home > Blog > [Post Title] */}
      <div className="bg-white dark:bg-[#03050c] border-b border-gray-200 dark:border-[#03050c]">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title, href: `/blog/${post.slug}` },
            ]}
          />
        </div>
      </div>

      {/* Hero Section with Featured Image */}
      <section className="relative w-full h-[400px] bg-gradient-to-r from-cc-green to-cc-blue">
        {post.featuredImage && (
          <div className="absolute inset-0">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>
        )}
        <div className="relative container mx-auto px-4 max-w-4xl h-full flex flex-col justify-end pb-12">
          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {post.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.author}</span>
            </div>
            <span>•</span>
            <time dateTime={post.publishedAt}>{publishedDate}</time>
            {post.readTime && (
              <>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Blog Post Content */}
      <article className="container mx-auto px-4 max-w-4xl py-12">
        {/* Excerpt */}
        {post.excerpt && (
          <div className="text-xl text-muted-foreground mb-8 pb-8 border-b border-border">
            {post.excerpt}
          </div>
        )}
        
        {/* Main Content with Markdown Rendering */}
        {/* Requirement: 4.7 - Support markdown formatting in blog post content */}
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-foreground/90 prose-a:text-cc-blue prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-cc-green prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md prose-blockquote:border-cc-green prose-blockquote:text-muted-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-muted text-foreground px-3 py-1 rounded-full text-sm hover:bg-muted/80 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
      
      {/* Back to Blog Link */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <a
          href="/blog"
          className="inline-flex items-center gap-2 text-cc-blue hover:text-cc-green transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Blog
        </a>
      </section>

      {/* Related Posts Section */}
      {/* Requirement: 4.8 - Display related posts on blog post detail pages based on category or tags */}
      <section className="container mx-auto px-4 max-w-4xl pb-12">
        <RelatedPosts posts={relatedPosts} />
      </section>
    </main>
  );
}

// Enable ISR with 1-hour revalidation
// Requirement: 12.7 - Implement incremental static regeneration for blog posts
export const revalidate = 3600;
