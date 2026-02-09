/**
 * Input Sanitization Utilities
 * 
 * This file contains sanitization functions for user input to prevent
 * XSS attacks and ensure data safety before storing in Google Sheets.
 * 
 * Uses DOMPurify to remove dangerous HTML/script content.
 * 
 * Requirements: 11.2
 */

import DOMPurify from 'dompurify';

// ============================================================================
// DOMPurify Setup for Node.js Environment
// ============================================================================

/**
 * Create a DOMPurify instance for server-side use
 * DOMPurify requires a DOM window object. In Node.js environment (like tests),
 * we create one using JSDOM. In browser environment, we use the global window.
 */
let purify: any;

if (typeof window === 'undefined') {
  // Node.js environment - use JSDOM
  const { JSDOM } = require('jsdom');
  const jsdomWindow = new JSDOM('').window;
  purify = DOMPurify(jsdomWindow as any);
} else {
  // Browser environment - use global window
  purify = DOMPurify(window);
}

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitizes general text input by removing all HTML tags and dangerous content
 * 
 * This function:
 * - Removes all HTML tags
 * - Removes script tags and event handlers
 * - Removes dangerous protocols (javascript:, data:, etc.)
 * - Trims whitespace
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string with all HTML removed
 * 
 * Requirements: 11.2
 * 
 * @example
 * sanitizeInput('Hello <script>alert("xss")</script> World')
 * // returns 'Hello  World'
 * 
 * sanitizeInput('<b>Bold text</b>')
 * // returns 'Bold text'
 * 
 * sanitizeInput('  Normal text  ')
 * // returns 'Normal text'
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Configure DOMPurify to remove all HTML tags
  const cleaned = purify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  // Trim whitespace and return
  return cleaned.trim();
}

/**
 * Sanitizes email addresses
 * 
 * This function:
 * - Converts to lowercase
 * - Removes whitespace
 * - Removes any HTML tags or dangerous content
 * - Ensures only valid email characters remain
 * 
 * @param email - The email address to sanitize
 * @returns Sanitized email address in lowercase
 * 
 * Requirements: 11.2
 * 
 * @example
 * sanitizeEmail('User@Example.COM')
 * // returns 'user@example.com'
 * 
 * sanitizeEmail('  user@example.com  ')
 * // returns 'user@example.com'
 * 
 * sanitizeEmail('user+tag@example.com')
 * // returns 'user+tag@example.com'
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // First, remove any HTML tags
  const cleaned = purify.sanitize(email, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // Convert to lowercase and trim
  const normalized = cleaned.toLowerCase().trim();

  // Remove any characters that are not valid in email addresses
  // Valid characters: alphanumeric, @, ., -, _, +
  const emailSafe = normalized.replace(/[^a-z0-9@.\-_+]/g, '');

  return emailSafe;
}

/**
 * Sanitizes HTML content while preserving safe formatting tags
 * 
 * This function is useful for rich text content like blog posts where
 * some HTML formatting is desired but dangerous content must be removed.
 * 
 * Allowed tags: p, br, strong, em, u, h1-h6, ul, ol, li, a, blockquote, code, pre
 * Allowed attributes: href (for links), class (for styling)
 * 
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML with only safe tags and attributes
 * 
 * Requirements: 11.2
 * 
 * @example
 * sanitizeHtml('<p>Safe content</p><script>alert("xss")</script>')
 * // returns '<p>Safe content</p>'
 * 
 * sanitizeHtml('<a href="javascript:alert()">Click</a>')
 * // returns '<a>Click</a>'
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Configure DOMPurify to allow safe HTML tags
  const cleaned = purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'code', 'pre',
      'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  return cleaned.trim();
}

/**
 * Sanitizes a URL to ensure it's safe
 * 
 * This function:
 * - Removes dangerous protocols (javascript:, data:, etc.)
 * - Ensures only http:, https:, mailto:, tel: protocols
 * - Removes any HTML tags
 * 
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 * 
 * Requirements: 11.2
 * 
 * @example
 * sanitizeUrl('https://example.com')
 * // returns 'https://example.com'
 * 
 * sanitizeUrl('javascript:alert("xss")')
 * // returns ''
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove any HTML tags first
  const cleaned = purify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();

  // Check if URL starts with a safe protocol
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
  const hasProtocol = safeProtocols.some(protocol => cleaned.toLowerCase().startsWith(protocol));

  // If no protocol, assume https:// for domain-like strings
  if (!hasProtocol) {
    // Check if it looks like a domain (contains a dot and no spaces)
    if (cleaned.includes('.') && !cleaned.includes(' ')) {
      return `https://${cleaned}`;
    }
    // Otherwise, it's not a valid URL
    return '';
  }

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(protocol => cleaned.toLowerCase().startsWith(protocol))) {
    return '';
  }

  return cleaned;
}

/**
 * Batch sanitize an object's string properties
 * 
 * This function recursively sanitizes all string values in an object
 * using the sanitizeInput function. It preserves the structure of the
 * object while cleaning all string values.
 * 
 * @param obj - The object to sanitize
 * @returns New object with sanitized string values
 * 
 * Requirements: 11.2
 * 
 * @example
 * sanitizeObject({ name: '<script>alert()</script>John', age: 30 })
 * // returns { name: 'John', age: 30 }
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => {
        if (typeof item === 'string') {
          return sanitizeInput(item);
        } else if (item && typeof item === 'object') {
          return sanitizeObject(item);
        }
        return item;
      });
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
