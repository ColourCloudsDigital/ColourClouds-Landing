/**
 * Unit Tests for Related Posts Logic
 * 
 * Tests the findRelatedPosts function to ensure it correctly:
 * - Finds posts with matching categories
 * - Finds posts with matching tags
 * - Scores and ranks posts by relevance
 * - Excludes the current post
 * - Handles edge cases
 * 
 * Requirements: 4.8
 */

import { findRelatedPosts } from '@/lib/related-posts';
import { BlogPost } from '@/lib/types';

/**
 * Helper function to create a mock blog post
 */
function createMockPost(
  id: string,
  slug: string,
  title: string,
  category: string,
  tags: string[]
): BlogPost {
  return {
    id,
    slug,
    title,
    author: 'Test Author',
    publishedAt: new Date().toISOString(),
    content: 'Test content',
    excerpt: 'Test excerpt',
    featuredImage: 'https://example.com/image.jpg',
    category,
    tags,
    status: 'published',
  };
}

describe('findRelatedPosts', () => {
  describe('Category Matching', () => {
    it('should find posts with the same category', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', ['vue']),
        createMockPost('3', 'post-3', 'Post 3', 'Design', ['ui']),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
      expect(related[0].category).toBe('Technology');
    });

    it('should prioritize posts with same category over different categories', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', []);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', []),
        createMockPost('3', 'post-3', 'Post 3', 'Design', []),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
    });
  });

  describe('Tag Matching', () => {
    it('should find posts with matching tags', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react', 'nextjs']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Design', ['react']),
        createMockPost('3', 'post-3', 'Post 3', 'Business', ['marketing']),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
      expect(related[0].tags).toContain('react');
    });

    it('should rank posts with more shared tags higher', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react', 'nextjs', 'typescript']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Design', ['react']), // 1 shared tag
        createMockPost('3', 'post-3', 'Post 3', 'Business', ['react', 'nextjs']), // 2 shared tags
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(2);
      expect(related[0].id).toBe('3'); // More shared tags, ranked first
      expect(related[1].id).toBe('2');
    });
  });

  describe('Combined Scoring', () => {
    it('should prioritize posts with both same category and shared tags', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react', 'nextjs']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', ['react']), // Same category + 1 tag
        createMockPost('3', 'post-3', 'Post 3', 'Design', ['react', 'nextjs']), // Different category + 2 tags
        createMockPost('4', 'post-4', 'Post 4', 'Technology', []), // Same category only
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(3);
      // Post 2: category (10) + 1 tag (5) = 15 points
      expect(related[0].id).toBe('2');
      // Post 3: 2 tags (10) = 10 points
      expect(related[1].id).toBe('3');
      // Post 4: category (10) = 10 points
      expect(related[2].id).toBe('4');
    });
  });

  describe('Edge Cases', () => {
    it('should exclude the current post from results', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', ['react']),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
      expect(related.find(p => p.id === '1')).toBeUndefined();
    });

    it('should return empty array when no related posts exist', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Design', ['ui']),
        createMockPost('3', 'post-3', 'Post 3', 'Business', ['marketing']),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(0);
    });

    it('should respect the limit parameter', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', ['vue']),
        createMockPost('3', 'post-3', 'Post 3', 'Technology', ['angular']),
        createMockPost('4', 'post-4', 'Post 4', 'Technology', ['svelte']),
        createMockPost('5', 'post-5', 'Post 5', 'Technology', ['ember']),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 2);

      expect(related).toHaveLength(2);
    });

    it('should handle posts with no tags', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', []);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', []),
        createMockPost('3', 'post-3', 'Post 3', 'Design', []),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
    });

    it('should handle posts with no category match and no tag match', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Design', ['ui']),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(0);
    });

    it('should handle empty allPosts array', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts: BlogPost[] = [];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(0);
    });

    it('should handle allPosts array with only the current post', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react']);
      const allPosts = [currentPost];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(0);
    });
  });

  describe('Relevance Scoring', () => {
    it('should score same category as 10 points', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', []);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Technology', []),
        createMockPost('3', 'post-3', 'Post 3', 'Design', []),
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      // Post 2 should be included (same category = 10 points)
      // Post 3 should not be included (no match = 0 points)
      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
    });

    it('should score each shared tag as 5 points', () => {
      const currentPost = createMockPost('1', 'post-1', 'Post 1', 'Technology', ['react', 'nextjs']);
      const allPosts = [
        currentPost,
        createMockPost('2', 'post-2', 'Post 2', 'Design', ['react']), // 5 points
        createMockPost('3', 'post-3', 'Post 3', 'Business', ['react', 'nextjs']), // 10 points
      ];

      const related = findRelatedPosts(currentPost, allPosts, 3);

      expect(related).toHaveLength(2);
      expect(related[0].id).toBe('3'); // Higher score (10 points)
      expect(related[1].id).toBe('2'); // Lower score (5 points)
    });
  });
});
