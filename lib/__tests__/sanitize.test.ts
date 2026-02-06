/**
 * Unit Tests for Input Sanitization Utilities
 * 
 * Tests sanitization functions for:
 * - General text input sanitization
 * - Email sanitization
 * - HTML content sanitization
 * - URL sanitization
 * - Object sanitization
 * 
 * Requirements: 11.2
 */

import {
  sanitizeInput,
  sanitizeEmail,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeObject,
} from '../sanitize';

// ============================================================================
// sanitizeInput Tests
// ============================================================================

describe('sanitizeInput', () => {
  describe('removes dangerous content', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello  World');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove all HTML tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <u>Underline</u>';
      const result = sanitizeInput(input);
      expect(result).toBe('Bold Italic Underline');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('Click me');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = sanitizeInput(input);
      expect(result).toBe('Link');
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('href');
    });

    it('should remove data: protocol', () => {
      const input = '<img src="data:text/html,<script>alert(\'xss\')</script>">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('data:');
      expect(result).not.toContain('script');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="evil.com"></iframe>';
      const result = sanitizeInput(input);
      expect(result).toBe('');
      expect(result).not.toContain('iframe');
    });

    it('should remove style tags', () => {
      const input = '<style>body { background: red; }</style>Text';
      const result = sanitizeInput(input);
      expect(result).toBe('Text');
      expect(result).not.toContain('style');
    });
  });

  describe('preserves safe content', () => {
    it('should preserve plain text', () => {
      const input = 'This is plain text';
      const result = sanitizeInput(input);
      expect(result).toBe('This is plain text');
    });

    it('should preserve text with numbers', () => {
      const input = 'Order #12345';
      const result = sanitizeInput(input);
      expect(result).toBe('Order #12345');
    });

    it('should preserve text with special characters', () => {
      const input = 'Price: $99.99 (20% off!)';
      const result = sanitizeInput(input);
      expect(result).toBe('Price: $99.99 (20% off!)');
    });

    it('should preserve newlines and spaces', () => {
      const input = 'Line 1\nLine 2\n  Indented';
      const result = sanitizeInput(input);
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
    });

    it('should preserve unicode characters', () => {
      const input = 'Hello 世界 🌍';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello 世界 🌍');
    });
  });

  describe('handles edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should handle null input', () => {
      const result = sanitizeInput(null as any);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = sanitizeInput(undefined as any);
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(123 as any)).toBe('');
      expect(sanitizeInput({} as any)).toBe('');
      expect(sanitizeInput([] as any)).toBe('');
    });

    it('should handle very long input', () => {
      const longInput = 'a'.repeat(10000) + '<script>alert("xss")</script>';
      const result = sanitizeInput(longInput);
      expect(result).not.toContain('<script>');
      expect(result.length).toBeLessThan(longInput.length);
    });
  });

  describe('handles complex XSS attempts', () => {
    it('should handle nested script tags', () => {
      const input = '<script><script>alert("xss")</script></script>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should handle encoded script tags', () => {
      const input = '&lt;script&gt;alert("xss")&lt;/script&gt;';
      const result = sanitizeInput(input);
      // Encoded entities are safe as plain text, they won't execute
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should handle SVG with script', () => {
      const input = '<svg><script>alert("xss")</script></svg>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<svg>');
      expect(result).not.toContain('<script>');
    });

    it('should handle img with onerror', () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      const result = sanitizeInput(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });
  });
});

// ============================================================================
// sanitizeEmail Tests
// ============================================================================

describe('sanitizeEmail', () => {
  describe('normalizes email addresses', () => {
    it('should convert to lowercase', () => {
      const email = 'User@Example.COM';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = '  user@example.com  ';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should preserve valid email characters', () => {
      const email = 'user+tag@example.com';
      const result = sanitizeEmail(email);
      expect(result).toBe('user+tag@example.com');
    });

    it('should preserve dots in email', () => {
      const email = 'first.last@example.com';
      const result = sanitizeEmail(email);
      expect(result).toBe('first.last@example.com');
    });

    it('should preserve hyphens and underscores', () => {
      const email = 'user-name_123@example.com';
      const result = sanitizeEmail(email);
      expect(result).toBe('user-name_123@example.com');
    });
  });

  describe('removes dangerous content', () => {
    it('should remove HTML tags', () => {
      const email = '<script>alert("xss")</script>user@example.com';
      const result = sanitizeEmail(email);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toBe('user@example.com');
    });

    it('should remove invalid characters', () => {
      const email = 'user@example.com<script>';
      const result = sanitizeEmail(email);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove spaces', () => {
      const email = 'user @example.com';
      const result = sanitizeEmail(email);
      expect(result).toBe('user@example.com');
    });

    it('should remove special characters not valid in emails', () => {
      const email = 'user!#$%&*@example.com';
      const result = sanitizeEmail(email);
      // Only valid email characters should remain
      expect(result).toMatch(/^[a-z0-9@.\-_+]+$/);
    });
  });

  describe('handles edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = sanitizeEmail('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = sanitizeEmail(null as any);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = sanitizeEmail(undefined as any);
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeEmail(123 as any)).toBe('');
      expect(sanitizeEmail({} as any)).toBe('');
    });

    it('should handle whitespace-only input', () => {
      const result = sanitizeEmail('   ');
      expect(result).toBe('');
    });
  });
});

// ============================================================================
// sanitizeHtml Tests
// ============================================================================

describe('sanitizeHtml', () => {
  describe('preserves safe HTML tags', () => {
    it('should preserve paragraph tags', () => {
      const html = '<p>This is a paragraph</p>';
      const result = sanitizeHtml(html);
      expect(result).toBe('<p>This is a paragraph</p>');
    });

    it('should preserve heading tags', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<h2>Subtitle</h2>');
    });

    it('should preserve formatting tags', () => {
      const html = '<strong>Bold</strong> <em>Italic</em>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>Italic</em>');
    });

    it('should preserve list tags', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    it('should preserve safe links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<a href="https://example.com">Link</a>');
    });

    it('should preserve code tags', () => {
      const html = '<code>const x = 1;</code>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<code>');
    });
  });

  describe('removes dangerous HTML', () => {
    it('should remove script tags', () => {
      const html = '<p>Safe content</p><script>alert("xss")</script>';
      const result = sanitizeHtml(html);
      expect(result).toBe('<p>Safe content</p>');
      expect(result).not.toContain('<script>');
    });

    it('should remove javascript: protocol from links', () => {
      const html = '<a href="javascript:alert(\'xss\')">Click</a>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('javascript:');
      // Link should be preserved but without dangerous href
      expect(result).toContain('<a>Click</a>');
    });

    it('should remove event handlers', () => {
      const html = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('onclick');
      expect(result).toBe('<p>Click me</p>');
    });

    it('should remove iframe tags', () => {
      const html = '<p>Content</p><iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('iframe');
      expect(result).toBe('<p>Content</p>');
    });

    it('should remove style tags', () => {
      const html = '<p>Content</p><style>body { background: red; }</style>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<style>');
      expect(result).toBe('<p>Content</p>');
    });
  });

  describe('handles edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = sanitizeHtml(null as any);
      expect(result).toBe('');
    });

    it('should handle plain text', () => {
      const html = 'Plain text without tags';
      const result = sanitizeHtml(html);
      expect(result).toBe('Plain text without tags');
    });

    it('should trim whitespace', () => {
      const html = '  <p>Content</p>  ';
      const result = sanitizeHtml(html);
      expect(result).toBe('<p>Content</p>');
    });
  });
});

// ============================================================================
// sanitizeUrl Tests
// ============================================================================

describe('sanitizeUrl', () => {
  describe('preserves safe URLs', () => {
    it('should preserve https URLs', () => {
      const url = 'https://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com');
    });

    it('should preserve http URLs', () => {
      const url = 'http://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('http://example.com');
    });

    it('should preserve mailto URLs', () => {
      const url = 'mailto:user@example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('mailto:user@example.com');
    });

    it('should preserve tel URLs', () => {
      const url = 'tel:+1234567890';
      const result = sanitizeUrl(url);
      expect(result).toBe('tel:+1234567890');
    });

    it('should add https:// to domain-like strings', () => {
      const url = 'example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com');
    });
  });

  describe('removes dangerous URLs', () => {
    it('should reject javascript: protocol', () => {
      const url = 'javascript:alert("xss")';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });

    it('should reject data: protocol', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });

    it('should reject vbscript: protocol', () => {
      const url = 'vbscript:msgbox("xss")';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });

    it('should reject file: protocol', () => {
      const url = 'file:///etc/passwd';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });

    it('should remove HTML tags from URL', () => {
      const url = '<script>alert("xss")</script>https://example.com';
      const result = sanitizeUrl(url);
      expect(result).not.toContain('<script>');
    });
  });

  describe('handles edge cases', () => {
    it('should return empty string for empty input', () => {
      const result = sanitizeUrl('');
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = sanitizeUrl(null as any);
      expect(result).toBe('');
    });

    it('should return empty string for URLs with spaces', () => {
      const url = 'not a url';
      const result = sanitizeUrl(url);
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const url = '  https://example.com  ';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com');
    });

    it('should handle non-string input', () => {
      expect(sanitizeUrl(123 as any)).toBe('');
      expect(sanitizeUrl({} as any)).toBe('');
    });
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

import * as fc from 'fast-check';

/**
 * Property 29: Input Sanitization
 * **Validates: Requirements 11.2**
 * 
 * Property: When any user input containing dangerous content (HTML tags,
 * script tags, event handlers, dangerous protocols) is sanitized,
 * the system SHALL:
 * 1. Remove all dangerous content (no <script>, <iframe>, onclick, etc.)
 * 2. Remove all HTML tags from general input
 * 3. Never allow javascript:, data:, vbscript:, or file: protocols
 * 
 * This property tests that sanitization is consistent and effective
 * across all types of malicious input. The focus is on ensuring dangerous
 * content is ALWAYS removed, which is the core security requirement.
 */
describe('Property 29: Input Sanitization', () => {
  it('should always remove dangerous HTML tags from input', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary text with dangerous HTML tags
        fc.record({
          safeText: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          dangerousTag: fc.constantFrom(
            '<script>alert("xss")</script>',
            '<iframe src="evil.com"></iframe>',
            '<img src="x" onerror="alert(\'xss\')">',
            '<svg onload="alert(\'xss\')">',
            '<style>body { display: none; }</style>',
            '<object data="evil.swf"></object>',
            '<embed src="evil.swf">',
            '<link rel="stylesheet" href="evil.css">',
            '<meta http-equiv="refresh" content="0;url=evil.com">'
          ),
          position: fc.constantFrom('before', 'after', 'both')
        }),
        async ({ safeText, dangerousTag, position }) => {
          // Arrange - Create input with dangerous content
          let input: string;
          switch (position) {
            case 'before':
              input = dangerousTag + safeText;
              break;
            case 'after':
              input = safeText + dangerousTag;
              break;
            case 'both':
              input = dangerousTag + safeText + dangerousTag;
              break;
          }

          // Act - Sanitize the input
          const result = sanitizeInput(input);

          // Assert - Property: Dangerous tags must be removed
          expect(result).not.toContain('<script');
          expect(result).not.toContain('<iframe');
          expect(result).not.toContain('<img');
          expect(result).not.toContain('<svg');
          expect(result).not.toContain('<style');
          expect(result).not.toContain('<object');
          expect(result).not.toContain('<embed');
          expect(result).not.toContain('<link');
          expect(result).not.toContain('<meta');
          expect(result).not.toContain('onerror');
          expect(result).not.toContain('onload');
          
          // Property: Result should not contain any HTML tags
          expect(result).not.toMatch(/<[^>]+>/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always remove event handlers from input', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary text with event handlers
        fc.record({
          safeText: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('<') && !s.includes('>')),
          eventHandler: fc.constantFrom(
            'onclick="alert(1)"',
            'onload="alert(1)"',
            'onerror="alert(1)"',
            'onmouseover="alert(1)"',
            'onfocus="alert(1)"',
            'onblur="alert(1)"',
            'onchange="alert(1)"',
            'onsubmit="alert(1)"'
          ),
          tagType: fc.constantFrom('div', 'img', 'input', 'button', 'a')
        }),
        async ({ safeText, eventHandler, tagType }) => {
          // Arrange - Create input with event handler
          const input = `<${tagType} ${eventHandler}>${safeText}</${tagType}>`;

          // Act - Sanitize the input
          const result = sanitizeInput(input);

          // Assert - Property: Event handlers must be removed
          expect(result).not.toContain('onclick');
          expect(result).not.toContain('onload');
          expect(result).not.toContain('onerror');
          expect(result).not.toContain('onmouseover');
          expect(result).not.toContain('onfocus');
          expect(result).not.toContain('onblur');
          expect(result).not.toContain('onchange');
          expect(result).not.toContain('onsubmit');
          expect(result).not.toContain('alert(1)');
          
          // Property: All HTML tags should be removed
          expect(result).not.toMatch(/<[^>]+>/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always reject dangerous URL protocols', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate URLs with dangerous protocols
        fc.record({
          protocol: fc.constantFrom(
            'javascript:',
            'data:',
            'vbscript:',
            'file:'
          ),
          payload: fc.constantFrom(
            'alert("xss")',
            'alert(1)',
            'void(0)',
            'msgbox("xss")',
            '///etc/passwd',
            'text/html,<script>alert(1)</script>'
          )
        }),
        async ({ protocol, payload }) => {
          // Arrange - Create dangerous URL
          const dangerousUrl = protocol + payload;

          // Act - Sanitize the URL
          const result = sanitizeUrl(dangerousUrl);

          // Assert - Property: Dangerous protocols must be rejected
          expect(result).toBe('');
          expect(result).not.toContain('javascript:');
          expect(result).not.toContain('data:');
          expect(result).not.toContain('vbscript:');
          expect(result).not.toContain('file:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always remove dangerous content from objects', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate objects with dangerous HTML content
        fc.record({
          dangerousContent: fc.constantFrom(
            '<script>alert("xss")</script>',
            '<iframe src="evil.com"></iframe>',
            '<img onerror="alert(1)">'
          )
        }),
        async ({ dangerousContent }) => {
          // Arrange - Create object with dangerous content
          const obj = {
            field1: dangerousContent,
            field2: 'safe text',
            nested: {
              field3: dangerousContent + ' more content'
            }
          };

          // Act - Sanitize the object
          const result = sanitizeObject(obj);

          // Assert - Property: Dangerous HTML content must be removed from all fields
          expect(result.field1).not.toContain('<script');
          expect(result.field1).not.toContain('<iframe');
          expect(result.field1).not.toContain('onerror');
          expect(result.field1).not.toContain('<img');
          
          expect(result.nested.field3).not.toContain('<script');
          expect(result.nested.field3).not.toContain('<iframe');
          expect(result.nested.field3).not.toContain('onerror');
          expect(result.nested.field3).not.toContain('<img');
          
          // Property: Safe content should be preserved
          expect(result.field2).toBe('safe text');
          
          // Property: "more content" should be preserved in nested field
          expect(result.nested.field3).toContain('more content');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sanitize email addresses to only contain valid characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate email addresses with various dangerous HTML content
        fc.record({
          validEmail: fc.emailAddress().filter(e => e.length > 5),
          dangerousContent: fc.constantFrom(
            '<script>',
            '<img src=x>'
          )
        }),
        async ({ validEmail, dangerousContent }) => {
          // Arrange - Create email with dangerous HTML content appended
          const input = validEmail + dangerousContent;

          // Act - Sanitize the email
          const result = sanitizeEmail(input);

          // Assert - Property: Dangerous HTML must be removed
          expect(result).not.toContain('<');
          expect(result).not.toContain('>');
          
          // Property: Result should only contain valid email characters
          expect(result).toMatch(/^[a-z0-9@.\-_+]*$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should remove nested dangerous content regardless of nesting level', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate nested dangerous content
        fc.record({
          safeText: fc.string({ minLength: 5, maxLength: 30 })
            .filter(s => s.trim().length >= 5 && /^[a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z][a-zA-Z0-9]+$/.test(s)),
          nestingLevel: fc.integer({ min: 1, max: 5 })
        }),
        async ({ safeText, nestingLevel }) => {
          // Arrange - Create nested script tags
          let input = safeText;
          for (let i = 0; i < nestingLevel; i++) {
            input = `<script>${input}</script>`;
          }

          // Act - Sanitize the input
          const result = sanitizeInput(input);

          // Assert - Property: All script tags must be removed regardless of nesting
          // This is the core security requirement
          expect(result).not.toContain('<script');
          expect(result).not.toContain('</script>');
          expect(result).not.toMatch(/<[^>]+>/); // No HTML tags at all
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should sanitize HTML content while preserving safe formatting', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate HTML with mix of safe and dangerous tags
        fc.record({
          safeContent: fc.string({ minLength: 3, maxLength: 50 })
            .filter(s => s.trim().length >= 3 && /^[a-zA-Z][a-zA-Z0-9\s]+$/.test(s)),
          safeTag: fc.constantFrom('p', 'strong', 'em', 'h1', 'h2', 'ul', 'li'),
          dangerousTag: fc.constantFrom('script', 'iframe', 'object', 'embed')
        }),
        async ({ safeContent, safeTag, dangerousTag }) => {
          // Arrange - Create HTML with safe and dangerous tags
          const input = `<${safeTag}>${safeContent}</${safeTag}><${dangerousTag}>evil</${dangerousTag}>`;

          // Act - Sanitize as HTML (preserves safe tags)
          const result = sanitizeHtml(input);

          // Assert - Property: Dangerous tags removed
          expect(result).not.toContain(`<${dangerousTag}`);
          
          // Property: Safe tags should be preserved
          expect(result).toContain(`<${safeTag}>`);
          expect(result).toContain(`</${safeTag}>`);
          
          // Property: Safe content should be preserved (text content, may be encoded)
          // Check that the text is present, even if special chars are encoded
          const textContent = result.replace(/<[^>]+>/g, '').trim();
          expect(textContent).toContain(safeContent.trim());
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// sanitizeObject Tests
// ============================================================================

describe('sanitizeObject', () => {
  describe('sanitizes object properties', () => {
    it('should sanitize string properties', () => {
      const obj = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
      };
      const result = sanitizeObject(obj);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should preserve non-string properties', () => {
      const obj = {
        name: 'John',
        age: 30,
        active: true,
      };
      const result = sanitizeObject(obj);
      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
      expect(result.active).toBe(true);
    });

    it('should sanitize array properties', () => {
      const obj = {
        tags: ['<b>tag1</b>', 'tag2', '<i>tag3</i>'],
      };
      const result = sanitizeObject(obj);
      expect(result.tags[0]).toBe('tag1');
      expect(result.tags[1]).toBe('tag2');
      expect(result.tags[2]).toBe('tag3');
    });

    it('should recursively sanitize nested objects', () => {
      const obj = {
        user: {
          name: '<b>John</b>',
          profile: {
            bio: '<i>Developer</i>',
          },
        },
      };
      const result = sanitizeObject(obj);
      expect(result.user.name).toBe('John');
      expect(result.user.profile.bio).toBe('Developer');
    });

    it('should handle mixed data types', () => {
      const obj = {
        name: '<b>John</b>',
        age: 30,
        tags: ['<i>tag1</i>', 'tag2'],
        metadata: {
          created: '2024-01-01',
          active: true,
        },
      };
      const result = sanitizeObject(obj);
      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
      expect(result.tags[0]).toBe('tag1');
      expect(result.metadata.created).toBe('2024-01-01');
      expect(result.metadata.active).toBe(true);
    });
  });

  describe('handles edge cases', () => {
    it('should handle empty object', () => {
      const obj = {};
      const result = sanitizeObject(obj);
      expect(result).toEqual({});
    });

    it('should handle null input', () => {
      const result = sanitizeObject(null as any);
      expect(result).toBeNull();
    });

    it('should handle undefined input', () => {
      const result = sanitizeObject(undefined as any);
      expect(result).toBeUndefined();
    });

    it('should handle object with null values', () => {
      const obj = {
        name: 'John',
        email: null,
      };
      const result = sanitizeObject(obj);
      expect(result.name).toBe('John');
      expect(result.email).toBeNull();
    });

    it('should handle empty arrays', () => {
      const obj = {
        tags: [],
      };
      const result = sanitizeObject(obj);
      expect(result.tags).toEqual([]);
    });
  });
});

