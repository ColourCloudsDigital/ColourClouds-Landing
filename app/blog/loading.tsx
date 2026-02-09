/**
 * Blog Loading State
 * 
 * Loading UI displayed while the blog listing page is being rendered.
 * This provides immediate feedback to users during server-side data fetching.
 * 
 * Requirement: 9.1 - Display loading indicator during data fetching
 */

export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cc-green to-cc-blue text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Insights, tutorials, and stories from the Colour Clouds Digital team
          </p>
        </div>
      </section>

      {/* Loading Skeleton */}
      <section className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              {/* Image Skeleton */}
              <div className="w-full h-48 bg-gray-300" />
              
              {/* Content Skeleton */}
              <div className="p-6">
                {/* Tags Skeleton */}
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-20 bg-gray-300 rounded-full" />
                  <div className="h-6 w-16 bg-gray-300 rounded-full" />
                </div>
                
                {/* Title Skeleton */}
                <div className="h-8 bg-gray-300 rounded mb-2" />
                
                {/* Excerpt Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 rounded" />
                  <div className="h-4 bg-gray-300 rounded" />
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                </div>
                
                {/* Meta Skeleton */}
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-300 rounded" />
                  <div className="h-4 w-20 bg-gray-300 rounded" />
                </div>
                
                {/* Read More Skeleton */}
                <div className="h-4 w-24 bg-gray-300 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
