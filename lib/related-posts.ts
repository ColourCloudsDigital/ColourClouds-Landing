/**
 * Related Posts Utility
 * 
 * Provides functionality to find related blog posts based on:
 * - Shared category
 * - Shared tags
 * - Relevance scoring
 * 
 * Requirements: 4.8
 */

import { BlogPost } from './types';

/**
 * Calculate relevance score between two blog posts
 * 
 * Scoring algorithm:
 * - Same category: +10 points
 * - Each shared tag: +5 points
 * 
 * @param currentPost - The current blog post
 * @param candidatePost - A candidate related post
 * @returns Relevance score (higher is more relevant)
 */
function calculateRelevanceScore(currentPost: BlogPost, candidatePost: BlogPost): number {
  let score = 0;

  // Same category adds 10 points
  if (currentPost.category === candidatePost.category) {
    score += 10;
  }

  // Each shared tag adds 5 points
  const currentTags = new Set(currentPost.tags);
  const sharedTags = candidatePost.tags.filter(tag => currentTags.has(tag));
  score += sharedTags.length * 5;

  return score;
}

/**
 * Find related blog posts based on category and tags
 * 
 * Algorithm:
 * 1. Filter out the current post
 * 2. Calculate relevance score for each candidate post
 * 3. Sort by relevance score (descending)
 * 4. Return top N posts
 * 
 * Requirements: 4.8 - Display related posts on blog post detail pages based on category or tags
 * 
 * @param currentPost - The current blog post
 * @param allPosts - Array of all available blog posts
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related blog posts, sorted by relevance
 */
export function findRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3
): BlogPost[] {
  // Filter out the current post and calculate scores
  const scoredPosts = allPosts
    .filter(post => post.id !== currentPost.id) // Exclude current post
    .map(post => ({
      post,
      score: calculateRelevanceScore(currentPost, post)
    }))
    .filter(item => item.score > 0) // Only include posts with some relevance
    .sort((a, b) => b.score - a.score); // Sort by score descending

  // Return top N posts
  return scoredPosts.slice(0, limit).map(item => item.post);
}
