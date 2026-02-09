/**
 * Blog Post Detail Loading State
 * 
 * Loading skeleton displayed while the blog post is being fetched.
 * Provides visual feedback to users during data loading.
 * 
 * Requirement: 9.1 - Display loading indicator during data fetching
 */

export default function BlogPostLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[400px] bg-gradient-to-r from-cc-green to-cc-blue animate-pulse">
        <div className="relative container mx-auto px-4 max-w-4xl h-full flex flex-col justify-end pb-12">
          {/* Category Badge Skeleton */}
          <div className="mb-4">
            <div className="inline-block bg-white/20 backdrop-blur-sm h-7 w-24 rounded-full" />
          </div>
          
          {/* Title Skeleton */}
          <div className="space-y-3 mb-4">
            <div className="h-12 bg-white/20 backdrop-blur-sm rounded w-3/4" />
            <div className="h-12 bg-white/20 backdrop-blur-sm rounded w-1/2" />
          </div>
          
          {/* Meta Information Skeleton */}
          <div className="flex gap-4">
            <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-32" />
            <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-24" />
            <div className="h-5 bg-white/20 backdrop-blur-sm rounded w-20" />
          </div>
        </div>
      </section>
      
      {/* Content Skeleton */}
      <article className="container mx-auto px-4 max-w-4xl py-12 animate-pulse">
        {/* Excerpt Skeleton */}
        <div className="mb-8 pb-8 border-b border-gray-200 space-y-3">
          <div className="h-6 bg-gray-300 rounded w-full" />
          <div className="h-6 bg-gray-300 rounded w-5/6" />
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-4/5" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          
          <div className="h-8 bg-gray-300 rounded w-2/3 mt-8" />
          
          <div className="h-4 bg-gray-300 rounded w-full mt-4" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
          
          <div className="h-64 bg-gray-300 rounded mt-8" />
          
          <div className="h-4 bg-gray-300 rounded w-full mt-8" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-4/5" />
        </div>
        
        {/* Tags Skeleton */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="h-6 bg-gray-300 rounded w-16 mb-4" />
          <div className="flex flex-wrap gap-2">
            <div className="h-8 bg-gray-300 rounded-full w-20" />
            <div className="h-8 bg-gray-300 rounded-full w-24" />
            <div className="h-8 bg-gray-300 rounded-full w-28" />
            <div className="h-8 bg-gray-300 rounded-full w-20" />
          </div>
        </div>
      </article>
      
      {/* Back Link Skeleton */}
      <section className="container mx-auto px-4 max-w-4xl pb-12 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-32" />
      </section>
    </main>
  );
}
