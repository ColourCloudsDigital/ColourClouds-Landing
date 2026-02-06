/**
 * TypeScript Type Definitions for Multipage Portfolio with Google Sheets Integration
 * 
 * This file contains all type definitions for:
 * - Blog posts
 * - Newsletter subscribers
 * - Contact form submissions
 * - Google Sheets configuration
 * - Custom error types
 */

// ============================================================================
// Blog Post Types
// ============================================================================

/**
 * Represents a blog post with all required fields
 * Requirements: 4.5
 */
export interface BlogPost {
  /** Unique identifier for the blog post */
  id: string;
  
  /** URL-friendly identifier used in dynamic routes */
  slug: string;
  
  /** Title of the blog post */
  title: string;
  
  /** Author name */
  author: string;
  
  /** Publication date in ISO 8601 format */
  publishedAt: string;
  
  /** Last update date in ISO 8601 format (optional) */
  updatedAt?: string;
  
  /** Full blog post content (supports markdown) */
  content: string;
  
  /** Short description/preview of the post */
  excerpt: string;
  
  /** URL to the featured image */
  featuredImage: string;
  
  /** Category of the blog post */
  category: string;
  
  /** Array of tags associated with the post */
  tags: string[];
  
  /** Publication status */
  status: 'draft' | 'published' | 'archived';
  
  /** Estimated reading time in minutes (optional) */
  readTime?: number;
}

// ============================================================================
// Newsletter Subscriber Types
// ============================================================================

/**
 * Represents a newsletter subscriber
 * Requirements: 3.5
 */
export interface Subscriber {
  /** Subscriber's email address */
  email: string;
  
  /** Subscriber's name (optional) */
  name?: string;
  
  /** Subscription date in ISO 8601 format */
  subscribedAt: string;
  
  /** Page path where the subscription occurred */
  source: string;
  
  /** Subscription status */
  status: 'active' | 'unsubscribed';
}

// ============================================================================
// Contact Submission Types
// ============================================================================

/**
 * Represents a contact form submission
 * Requirements: 5.5
 */
export interface ContactSubmission {
  /** Unique identifier for the submission */
  id: string;
  
  /** Submitter's name */
  name: string;
  
  /** Submitter's email address */
  email: string;
  
  /** Subject of the message */
  subject: string;
  
  /** Message content */
  message: string;
  
  /** Submission date in ISO 8601 format */
  submittedAt: string;
  
  /** Status of the submission */
  status: 'new' | 'read' | 'responded' | 'archived';
  
  /** IP address of the submitter (optional, for spam protection) */
  ipAddress?: string;
}

// ============================================================================
// Google Sheets Configuration Types
// ============================================================================

/**
 * Configuration for Google Sheets integration
 * Requirements: 2.1
 */
export interface GoogleSheetsConfig {
  /** Google Sheets spreadsheet ID */
  spreadsheetId: string;
  
  /** Sheet names for different data types */
  sheets: {
    /** Sheet name for blog posts */
    blog: string;
    
    /** Sheet name for newsletter subscribers */
    newsletter: string;
    
    /** Sheet name for contact submissions */
    contact: string;
  };
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error for Google Sheets API operations
 * Requirements: 2.4, 2.5
 */
export class GoogleSheetsError extends Error {
  /** Error code for categorization */
  public code: string;
  
  /** HTTP status code */
  public statusCode: number;
  
  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'GoogleSheetsError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GoogleSheetsError);
    }
  }
}

/**
 * Custom error for validation failures
 * Requirements: 3.3, 3.4, 5.3, 5.4, 11.5
 */
export class ValidationError extends Error {
  /** Field name that failed validation */
  public field: string;
  
  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Custom error for rate limit violations
 * Requirements: 2.4, 11.6
 */
export class RateLimitError extends Error {
  /** Number of seconds to wait before retrying */
  public retryAfter: number;
  
  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Generic API response type
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the operation was successful */
  success: boolean;
  
  /** Response data (present on success) */
  data?: T;
  
  /** Error message (present on failure) */
  error?: string;
  
  /** Additional error details (optional) */
  details?: Record<string, unknown>;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  /** Indicates if validation passed */
  isValid: boolean;
  
  /** Map of field names to error messages */
  errors: Record<string, string>;
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Time-to-live in seconds */
  ttl: number;
  
  /** Cache tags for invalidation */
  tags?: string[];
}
