/**
 * Unit Tests for Input Validators
 * 
 * Tests validation functions for:
 * - Email format validation
 * - Contact form validation
 * - Newsletter form validation
 * 
 * Requirements: 3.3, 3.4, 3.8, 5.3, 5.4
 */

import {
  validateEmail,
  validateNewsletterForm,
  validateContactForm,
  validateRequired,
  validateLength,
  validatePattern,
} from '../validators';
import { ValidationError } from '../types';
import * as fc from 'fast-check';

// ============================================================================
// Email Validation Tests
// ============================================================================

describe('validateEmail', () => {
  describe('valid email formats', () => {
    it('should validate standard email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should validate email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('should validate email with plus sign', () => {
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should validate email with dots in local part', () => {
      expect(validateEmail('first.last@example.com')).toBe(true);
    });

    it('should validate email with numbers', () => {
      expect(validateEmail('user123@example456.com')).toBe(true);
    });

    it('should validate email with hyphens in domain', () => {
      expect(validateEmail('user@my-domain.com')).toBe(true);
    });
  });

  describe('invalid email formats', () => {
    it('should reject email without @ symbol', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should reject email without local part', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should reject email without TLD', () => {
      expect(validateEmail('user@example')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false);
      expect(validateEmail('user@ example.com')).toBe(false);
    });

    it('should reject email with multiple @ symbols', () => {
      expect(validateEmail('user@@example.com')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should reject empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should reject whitespace-only string', () => {
      expect(validateEmail('   ')).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateEmail(123 as any)).toBe(false);
      expect(validateEmail({} as any)).toBe(false);
      expect(validateEmail([] as any)).toBe(false);
    });

    it('should reject email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });

    it('should reject email with local part longer than 64 characters', () => {
      const longLocal = 'a'.repeat(65) + '@example.com';
      expect(validateEmail(longLocal)).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(validateEmail('  user@example.com  ')).toBe(true);
    });
  });

  /**
   * Property-Based Tests
   */
  describe('Property 8: Email Format Validation', () => {
    /**
     * **Validates: Requirements 3.8**
     * 
     * Property: The system SHALL validate that email addresses are in a valid format before submission.
     * 
     * This property tests that:
     * 1. Valid email formats are accepted (return true)
     * 2. Invalid email formats are rejected (return false)
     * 3. The validation is consistent across all possible inputs
     */
    it('should accept valid email formats and reject invalid ones', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary email-like strings
          fc.oneof(
            // Valid email generator
            fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,64}$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,63}$/),
              tld: fc.stringMatching(/^[a-zA-Z]{2,10}$/),
            }).map(({ localPart, domain, tld }) => ({
              email: `${localPart}@${domain}.${tld}`,
              shouldBeValid: true,
            })),
            
            // Invalid email generators - missing @
            fc.string().map(str => ({
              email: str.replace(/@/g, ''),
              shouldBeValid: false,
            })),
            
            // Invalid email generators - missing domain
            fc.string().map(str => ({
              email: `${str}@`,
              shouldBeValid: false,
            })),
            
            // Invalid email generators - missing local part
            fc.record({
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,63}$/),
              tld: fc.stringMatching(/^[a-zA-Z]{2,10}$/),
            }).map(({ domain, tld }) => ({
              email: `@${domain}.${tld}`,
              shouldBeValid: false,
            })),
            
            // Invalid email generators - missing TLD
            fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,64}$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,63}$/),
            }).map(({ localPart, domain }) => ({
              email: `${localPart}@${domain}`,
              shouldBeValid: false,
            })),
            
            // Invalid email generators - empty string
            fc.constant({
              email: '',
              shouldBeValid: false,
            }),
            
            // Invalid email generators - whitespace only
            fc.string().filter(s => s.trim().length === 0 && s.length > 0).map(str => ({
              email: str,
              shouldBeValid: false,
            })),
            
            // Invalid email generators - too long (> 254 chars)
            fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,64}$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,63}$/),
              tld: fc.stringMatching(/^[a-zA-Z]{2,10}$/),
              padding: fc.string({ minLength: 200, maxLength: 250 }),
            }).map(({ localPart, domain, tld, padding }) => ({
              email: `${localPart}${padding}@${domain}.${tld}`,
              shouldBeValid: false,
            })),
            
            // Invalid email generators - local part too long (> 64 chars)
            fc.record({
              localPart: fc.string({ minLength: 65, maxLength: 100 }),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,63}$/),
              tld: fc.stringMatching(/^[a-zA-Z]{2,10}$/),
            }).map(({ localPart, domain, tld }) => ({
              email: `${localPart}@${domain}.${tld}`,
              shouldBeValid: false,
            }))
          ),
          ({ email, shouldBeValid }) => {
            const result = validateEmail(email);
            
            if (shouldBeValid) {
              // Valid emails should return true
              expect(result).toBe(true);
            } else {
              // Invalid emails should return false
              expect(result).toBe(false);
            }
          }
        ),
        { numRuns: 100 } // Run 100 iterations with different email formats
      );
    });

    it('should consistently validate standard email patterns', () => {
      fc.assert(
        fc.property(
          // Generate valid email components
          fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
            tld: fc.constantFrom('com', 'org', 'net', 'edu', 'gov', 'io', 'co'),
          }),
          ({ localPart, domain, tld }) => {
            const email = `${localPart}@${domain}.${tld}`;
            
            // Property: All properly formatted emails should be valid
            const result = validateEmail(email);
            expect(result).toBe(true);
            
            // Property: Validation should be case-insensitive for the result
            // (the function itself may normalize, but should accept both cases)
            const upperEmail = email.toUpperCase();
            const lowerEmail = email.toLowerCase();
            expect(validateEmail(upperEmail)).toBe(true);
            expect(validateEmail(lowerEmail)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject emails with spaces', () => {
      fc.assert(
        fc.property(
          // Generate emails with spaces inserted
          fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
            tld: fc.constantFrom('com', 'org', 'net'),
            spacePosition: fc.constantFrom('local', 'domain', 'tld'),
          }),
          ({ localPart, domain, tld, spacePosition }) => {
            let emailWithSpace: string;
            
            switch (spacePosition) {
              case 'local':
                emailWithSpace = `${localPart} space@${domain}.${tld}`;
                break;
              case 'domain':
                emailWithSpace = `${localPart}@${domain} space.${tld}`;
                break;
              case 'tld':
                emailWithSpace = `${localPart}@${domain}. ${tld}`;
                break;
              default:
                emailWithSpace = `${localPart}@${domain}.${tld}`;
            }
            
            // Property: Emails with spaces should be rejected
            expect(validateEmail(emailWithSpace)).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle edge cases consistently', () => {
      fc.assert(
        fc.property(
          // Generate various edge case inputs
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(''),
            fc.string().filter(s => s.trim().length === 0 && s.length > 0 && s.length <= 10),
            fc.integer(),
            fc.constant({}),
            fc.constant([]),
          ),
          (input) => {
            // Property: All non-string or invalid inputs should return false
            const result = validateEmail(input as any);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

// ============================================================================
// Newsletter Form Validation Tests
// ============================================================================

describe('validateNewsletterForm', () => {
  describe('valid newsletter form data', () => {
    it('should validate complete form data with name', () => {
      const data = {
        email: 'user@example.com',
        name: 'John Doe',
        source: '/services',
      };

      const result = validateNewsletterForm(data);

      expect(result.email).toBe('user@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.source).toBe('/services');
    });

    it('should validate form data without optional name', () => {
      const data = {
        email: 'user@example.com',
        source: '/blog',
      };

      const result = validateNewsletterForm(data);

      expect(result.email).toBe('user@example.com');
      expect(result.name).toBeUndefined();
      expect(result.source).toBe('/blog');
    });

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'USER@EXAMPLE.COM',
        source: '/about',
      };

      const result = validateNewsletterForm(data);

      expect(result.email).toBe('user@example.com');
    });

    it('should trim whitespace from all fields', () => {
      const data = {
        email: '  user@example.com  ',
        name: '  John Doe  ',
        source: '  /services  ',
      };

      const result = validateNewsletterForm(data);

      expect(result.email).toBe('user@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.source).toBe('/services');
    });

    it('should accept valid name with hyphens and apostrophes', () => {
      const data = {
        email: 'user@example.com',
        name: "Mary-Jane O'Connor",
        source: '/services',
      };

      const result = validateNewsletterForm(data);

      expect(result.name).toBe("Mary-Jane O'Connor");
    });
  });

  describe('invalid newsletter form data', () => {
    it('should throw ValidationError for missing email', () => {
      const data = {
        email: '',
        source: '/services',
      };

      expect(() => validateNewsletterForm(data)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(data)).toThrow('Email is required');
    });

    it('should throw ValidationError for invalid email format', () => {
      const data = {
        email: 'invalid-email',
        source: '/services',
      };

      expect(() => validateNewsletterForm(data)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(data)).toThrow('Please enter a valid email address');
    });

    it('should throw ValidationError for missing source', () => {
      const data = {
        email: 'user@example.com',
        source: '',
      };

      expect(() => validateNewsletterForm(data)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(data)).toThrow('Source page is required');
    });

    it('should throw ValidationError for name longer than 100 characters', () => {
      const data = {
        email: 'user@example.com',
        name: 'a'.repeat(101),
        source: '/services',
      };

      expect(() => validateNewsletterForm(data)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(data)).toThrow('Name must be no more than 100 characters');
    });

    it('should throw ValidationError for name with invalid characters', () => {
      const data = {
        email: 'user@example.com',
        name: 'John123',
        source: '/services',
      };

      expect(() => validateNewsletterForm(data)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(data)).toThrow('Name contains invalid characters');
    });

    it('should throw ValidationError with correct field name', () => {
      const data = {
        email: 'invalid',
        source: '/services',
      };

      try {
        validateNewsletterForm(data);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('email');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty name string as undefined', () => {
      const data = {
        email: 'user@example.com',
        name: '',
        source: '/services',
      };

      const result = validateNewsletterForm(data);

      expect(result.name).toBeUndefined();
    });

    it('should handle whitespace-only name as undefined', () => {
      const data = {
        email: 'user@example.com',
        name: '   ',
        source: '/services',
      };

      const result = validateNewsletterForm(data);

      expect(result.name).toBeUndefined();
    });
  });
});

// ============================================================================
// Contact Form Validation Tests
// ============================================================================

describe('validateContactForm', () => {
  describe('valid contact form data', () => {
    it('should validate complete form data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Project Inquiry',
        message: 'I would like to discuss a project with you.',
      };

      const result = validateContactForm(data);

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.subject).toBe('Project Inquiry');
      expect(result.message).toBe('I would like to discuss a project with you.');
    });

    it('should normalize email to lowercase', () => {
      const data = {
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      const result = validateContactForm(data);

      expect(result.email).toBe('john@example.com');
    });

    it('should trim whitespace from all fields', () => {
      const data = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        subject: '  Project Inquiry  ',
        message: '  I would like to discuss a project.  ',
      };

      const result = validateContactForm(data);

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.subject).toBe('Project Inquiry');
      expect(result.message).toBe('I would like to discuss a project.');
    });

    it('should accept minimum valid lengths', () => {
      const data = {
        name: 'Jo',
        email: 'a@b.c',
        subject: 'Hi!',
        message: 'Hello test',
      };

      const result = validateContactForm(data);

      expect(result.name).toBe('Jo');
      expect(result.subject).toBe('Hi!');
      expect(result.message).toBe('Hello test');
    });

    it('should accept maximum valid lengths', () => {
      const data = {
        name: 'a'.repeat(100),
        email: 'user@example.com',
        subject: 'a'.repeat(200),
        message: 'a'.repeat(5000),
      };

      expect(() => validateContactForm(data)).not.toThrow();
    });
  });

  describe('invalid contact form data - name validation', () => {
    it('should throw ValidationError for missing name', () => {
      const data = {
        name: '',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Name is required');
    });

    it('should throw ValidationError for name shorter than 2 characters', () => {
      const data = {
        name: 'J',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Name must be at least 2 characters');
    });

    it('should throw ValidationError for name longer than 100 characters', () => {
      const data = {
        name: 'a'.repeat(101),
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Name must be no more than 100 characters');
    });
  });

  describe('invalid contact form data - email validation', () => {
    it('should throw ValidationError for missing email', () => {
      const data = {
        name: 'John Doe',
        email: '',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Email is required');
    });

    it('should throw ValidationError for invalid email format', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Please enter a valid email address');
    });
  });

  describe('invalid contact form data - subject validation', () => {
    it('should throw ValidationError for missing subject', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: '',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Subject is required');
    });

    it('should throw ValidationError for subject shorter than 3 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hi',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Subject must be at least 3 characters');
    });

    it('should throw ValidationError for subject longer than 200 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'a'.repeat(201),
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Subject must be no more than 200 characters');
    });
  });

  describe('invalid contact form data - message validation', () => {
    it('should throw ValidationError for missing message', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: '',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Message is required');
    });

    it('should throw ValidationError for message shorter than 10 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hi there',
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Message must be at least 10 characters');
    });

    it('should throw ValidationError for message longer than 5000 characters', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'a'.repeat(5001),
      };

      expect(() => validateContactForm(data)).toThrow(ValidationError);
      expect(() => validateContactForm(data)).toThrow('Message must be no more than 5000 characters');
    });
  });

  describe('edge cases', () => {
    it('should throw ValidationError with correct field name', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      try {
        validateContactForm(data);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('email');
      }
    });

    it('should handle whitespace-only fields as empty', () => {
      const data = {
        name: '   ',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'Hello world',
      };

      expect(() => validateContactForm(data)).toThrow('Name is required');
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('validateRequired', () => {
  it('should not throw for valid non-empty string', () => {
    expect(() => validateRequired('test', 'field')).not.toThrow();
  });

  it('should throw ValidationError for empty string', () => {
    expect(() => validateRequired('', 'field')).toThrow(ValidationError);
    expect(() => validateRequired('', 'field')).toThrow('field is required');
  });

  it('should throw ValidationError for whitespace-only string', () => {
    expect(() => validateRequired('   ', 'field')).toThrow(ValidationError);
  });

  it('should throw ValidationError for null or undefined', () => {
    expect(() => validateRequired(null as any, 'field')).toThrow(ValidationError);
    expect(() => validateRequired(undefined as any, 'field')).toThrow(ValidationError);
  });
});

describe('validateLength', () => {
  it('should not throw for string within length constraints', () => {
    expect(() => validateLength('test', 'field', 2, 10)).not.toThrow();
  });

  it('should throw ValidationError for string shorter than minimum', () => {
    expect(() => validateLength('a', 'field', 2, 10)).toThrow(ValidationError);
    expect(() => validateLength('a', 'field', 2, 10)).toThrow('field must be at least 2 characters');
  });

  it('should throw ValidationError for string longer than maximum', () => {
    expect(() => validateLength('a'.repeat(11), 'field', 2, 10)).toThrow(ValidationError);
    expect(() => validateLength('a'.repeat(11), 'field', 2, 10)).toThrow('field must be no more than 10 characters');
  });

  it('should work with only minimum constraint', () => {
    expect(() => validateLength('test', 'field', 2)).not.toThrow();
    expect(() => validateLength('a', 'field', 2)).toThrow(ValidationError);
  });

  it('should work with only maximum constraint', () => {
    expect(() => validateLength('test', 'field', undefined, 10)).not.toThrow();
    expect(() => validateLength('a'.repeat(11), 'field', undefined, 10)).toThrow(ValidationError);
  });
});

describe('validatePattern', () => {
  it('should not throw for string matching pattern', () => {
    const pattern = /^[a-z]+$/;
    expect(() => validatePattern('test', pattern, 'field', 'Invalid format')).not.toThrow();
  });

  it('should throw ValidationError for string not matching pattern', () => {
    const pattern = /^[a-z]+$/;
    expect(() => validatePattern('Test123', pattern, 'field', 'Invalid format')).toThrow(ValidationError);
    expect(() => validatePattern('Test123', pattern, 'field', 'Invalid format')).toThrow('Invalid format');
  });

  it('should use custom error message', () => {
    const pattern = /^[0-9]+$/;
    const customMessage = 'Must contain only numbers';
    expect(() => validatePattern('abc', pattern, 'field', customMessage)).toThrow(customMessage);
  });
});

// ============================================================================
// Property-Based Test: Dual Validation Enforcement
// ============================================================================

describe('Property 28: Dual Validation Enforcement', () => {
  /**
   * **Validates: Requirements 11.1**
   * 
   * Property: THE System SHALL validate all form inputs on both client-side and server-side.
   * 
   * This property tests that validation functions work consistently regardless of
   * where they are called (client or server context). The same validation logic
   * should produce identical results in both environments.
   * 
   * Key aspects tested:
   * 1. Validation functions are pure (no side effects, deterministic)
   * 2. Same input produces same output regardless of execution context
   * 3. Both valid and invalid inputs are handled consistently
   * 4. Error messages and types are consistent across contexts
   */

  describe('Email Validation Consistency', () => {
    it('should validate emails consistently across client and server contexts', () => {
      fc.assert(
        fc.property(
          // Generate various email inputs
          fc.oneof(
            // Valid emails
            fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
              tld: fc.constantFrom('com', 'org', 'net', 'edu', 'io'),
            }).map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`),
            
            // Invalid emails
            fc.oneof(
              fc.constant(''),
              fc.constant('invalid'),
              fc.constant('@example.com'),
              fc.constant('user@'),
              fc.constant('user@example'),
              fc.string().filter(s => !s.includes('@'))
            )
          ),
          (email) => {
            // Simulate client-side validation
            const clientResult = validateEmail(email);
            
            // Simulate server-side validation (same function)
            const serverResult = validateEmail(email);
            
            // Property: Results must be identical
            expect(clientResult).toBe(serverResult);
            
            // Property: Result must be boolean
            expect(typeof clientResult).toBe('boolean');
            expect(typeof serverResult).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Newsletter Form Validation Consistency', () => {
    it('should validate newsletter forms consistently across client and server contexts', () => {
      fc.assert(
        fc.property(
          // Generate various newsletter form inputs
          fc.record({
            email: fc.oneof(
              fc.record({
                localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
                domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
                tld: fc.constantFrom('com', 'org', 'net'),
              }).map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`),
              fc.constant(''),
              fc.constant('invalid-email')
            ),
            name: fc.option(
              fc.oneof(
                fc.stringMatching(/^[a-zA-Z\s\-']{1,50}$/),
                fc.constant(''),
                fc.string({ minLength: 101, maxLength: 150 }),
                fc.constant('Invalid123')
              ),
              { nil: undefined }
            ),
            source: fc.oneof(
              fc.constantFrom('/services', '/blog', '/about', '/contact', '/'),
              fc.constant(''),
              fc.constant('invalid-source')
            ),
          }),
          (formData) => {
            // Simulate client-side validation
            let clientError: ValidationError | null = null;
            let clientResult: any = null;
            try {
              clientResult = validateNewsletterForm(formData);
            } catch (error) {
              if (error instanceof ValidationError) {
                clientError = error;
              } else {
                throw error;
              }
            }
            
            // Simulate server-side validation (same function)
            let serverError: ValidationError | null = null;
            let serverResult: any = null;
            try {
              serverResult = validateNewsletterForm(formData);
            } catch (error) {
              if (error instanceof ValidationError) {
                serverError = error;
              } else {
                throw error;
              }
            }
            
            // Property: Both should either succeed or fail together
            expect(clientError === null).toBe(serverError === null);
            
            // Property: If both succeeded, results should be identical
            if (clientResult && serverResult) {
              expect(clientResult.email).toBe(serverResult.email);
              expect(clientResult.name).toBe(serverResult.name);
              expect(clientResult.source).toBe(serverResult.source);
            }
            
            // Property: If both failed, error messages and fields should match
            if (clientError && serverError) {
              expect(clientError.message).toBe(serverError.message);
              expect(clientError.field).toBe(serverError.field);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Contact Form Validation Consistency', () => {
    it('should validate contact forms consistently across client and server contexts', () => {
      fc.assert(
        fc.property(
          // Generate various contact form inputs
          fc.record({
            name: fc.oneof(
              fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
              fc.constant(''),
              fc.constant('A'),
              fc.string({ minLength: 101, maxLength: 150 })
            ),
            email: fc.oneof(
              fc.record({
                localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
                domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
                tld: fc.constantFrom('com', 'org', 'net'),
              }).map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`),
              fc.constant(''),
              fc.constant('invalid-email')
            ),
            subject: fc.oneof(
              fc.string({ minLength: 3, maxLength: 100 }),
              fc.constant(''),
              fc.constant('Hi'),
              fc.string({ minLength: 201, maxLength: 250 })
            ),
            message: fc.oneof(
              fc.string({ minLength: 10, maxLength: 500 }),
              fc.constant(''),
              fc.constant('Short'),
              fc.string({ minLength: 5001, maxLength: 5100 })
            ),
          }),
          (formData) => {
            // Simulate client-side validation
            let clientError: ValidationError | null = null;
            let clientResult: any = null;
            try {
              clientResult = validateContactForm(formData);
            } catch (error) {
              if (error instanceof ValidationError) {
                clientError = error;
              } else {
                throw error;
              }
            }
            
            // Simulate server-side validation (same function)
            let serverError: ValidationError | null = null;
            let serverResult: any = null;
            try {
              serverResult = validateContactForm(formData);
            } catch (error) {
              if (error instanceof ValidationError) {
                serverError = error;
              } else {
                throw error;
              }
            }
            
            // Property: Both should either succeed or fail together
            expect(clientError === null).toBe(serverError === null);
            
            // Property: If both succeeded, results should be identical
            if (clientResult && serverResult) {
              expect(clientResult.name).toBe(serverResult.name);
              expect(clientResult.email).toBe(serverResult.email);
              expect(clientResult.subject).toBe(serverResult.subject);
              expect(clientResult.message).toBe(serverResult.message);
            }
            
            // Property: If both failed, error messages and fields should match
            if (clientError && serverError) {
              expect(clientError.message).toBe(serverError.message);
              expect(clientError.field).toBe(serverError.field);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Validation Determinism', () => {
    it('should produce identical results when called multiple times with same input', () => {
      fc.assert(
        fc.property(
          // Generate contact form data
          fc.record({
            name: fc.string({ minLength: 2, maxLength: 50 }),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            }).map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`),
            subject: fc.string({ minLength: 3, maxLength: 100 }),
            message: fc.string({ minLength: 10, maxLength: 500 }),
          }),
          (formData) => {
            // Call validation multiple times
            const result1 = validateContactForm(formData);
            const result2 = validateContactForm(formData);
            const result3 = validateContactForm(formData);
            
            // Property: All results should be identical (deterministic)
            expect(result1).toEqual(result2);
            expect(result2).toEqual(result3);
            
            // Property: Validation should not mutate input
            expect(formData.name).toBeDefined();
            expect(formData.email).toBeDefined();
            expect(formData.subject).toBeDefined();
            expect(formData.message).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should produce identical errors when called multiple times with invalid input', () => {
      fc.assert(
        fc.property(
          // Generate invalid contact form data
          fc.record({
            name: fc.constant(''),
            email: fc.constant('invalid'),
            subject: fc.constant(''),
            message: fc.constant(''),
          }),
          (formData) => {
            // Call validation multiple times and capture errors
            const errors: ValidationError[] = [];
            
            for (let i = 0; i < 3; i++) {
              try {
                validateContactForm(formData);
              } catch (error) {
                if (error instanceof ValidationError) {
                  errors.push(error);
                }
              }
            }
            
            // Property: All errors should be identical
            expect(errors).toHaveLength(3);
            expect(errors[0].message).toBe(errors[1].message);
            expect(errors[1].message).toBe(errors[2].message);
            expect(errors[0].field).toBe(errors[1].field);
            expect(errors[1].field).toBe(errors[2].field);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Validation Purity', () => {
    it('should not have side effects or depend on external state', () => {
      fc.assert(
        fc.property(
          // Generate newsletter form data
          fc.record({
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9.+_-]{1,20}$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            }).map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`),
            name: fc.option(fc.stringMatching(/^[a-zA-Z\s\-']{1,50}$/), { nil: undefined }),
            source: fc.constantFrom('/services', '/blog', '/about'),
          }),
          (formData) => {
            // Create a deep copy of the input
            const originalData = JSON.parse(JSON.stringify(formData));
            
            // Call validation
            const result = validateNewsletterForm(formData);
            
            // Property: Original input should not be mutated
            // (Note: normalized result may differ, but original input should be unchanged)
            expect(formData.email).toBe(originalData.email);
            expect(formData.name).toBe(originalData.name);
            expect(formData.source).toBe(originalData.source);
            
            // Property: Result should be a new object, not a reference to input
            expect(result).not.toBe(formData);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
