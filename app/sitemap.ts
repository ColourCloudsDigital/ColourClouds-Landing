import { MetadataRoute } from "next";
import { getCachedBlogPosts } from "@/lib/cache";

/**
 * Generate dynamic sitemap for the website
 * 
 * Includes:
 * - All static pages (home, services, about, blog, contact, docs, inators)
 * - Dynamic blog post pages (/blog/[slug])
 * 
 * Requirements: 6.5
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://colourclouds.ng";

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/inators`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Fetch dynamic blog post pages
  let blogPages: MetadataRoute.Sitemap = [];
  
  try {
    const blogPosts = await getCachedBlogPosts();
    
    blogPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    // If fetching blog posts fails, log the error but continue with static pages
    console.error("Failed to fetch blog posts for sitemap:", error);
  }

  // Combine static and dynamic pages
  return [...staticPages, ...blogPages];
}
