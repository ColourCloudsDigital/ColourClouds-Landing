/**
 * Unit Tests for Newsletter API Route Logic
 * 
 * Tests the newsletter subscription validation and sanitization logic:
 * - Valid subscription data validation
 * - Invalid email rejection
 * - Missing field validation
 * - Sanitization of inputs
 * - Name validation
 * 
 * Requirements: 3.2, 3.3, 11.6
 */

/**
 * @jest-environment node
 */

import { validateNewsletterForm } from '@/lib/validators';
import { sanitizeEmail, sanitizeInput } from '@/lib/sanitize';
import { ValidationError } from '@/lib/types';

describe('Newsletter API Route Logic', () => {
  describe('Valid Subscription Data', () => {
    it('should validate correct newsletter form data', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('test@example.com');
      expect(result.source).toBe('/services');
    });

    it('should validate newsletter form with name', () => {
      // Arrange
      const formData = {
        email: 'john.doe@example.com',
        name: 'John Doe',
        source: '/about',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('john.doe@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.source).toBe('/about');
    });

    it('should normalize email to lowercase', () => {
      // Arrange
      const formData = {
        email: 'Test@EXAMPLE.COM',
        source: '/blog',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('test@example.com');
    });

    it('should trim whitespace from inputs', () => {
      // Arrange
      const formData = {
        email: '  test@example.com  ',
        name: '  John Doe  ',
        source: '  /contact  ',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.source).toBe('/contact');
    });
  });

  describe('Invalid Email Rejection', () => {
    it('should reject invalid email format', () => {
      // Arrange
      const formData = {
        email: 'invalid-email',
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(formData)).toThrow('valid email');
    });

    it('should reject empty email', () => {
      // Arrange
      const formData = {
        email: '',
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(formData)).toThrow('required');
    });

    it('should reject missing email', () => {
      // Arrange
      const formData = {
        source: '/services',
      } as any;

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
    });

    it('should reject email without domain', () => {
      // Arrange
      const formData = {
        email: 'test@',
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
    });

    it('should reject email without @ symbol', () => {
      // Arrange
      const formData = {
        email: 'testexample.com',
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
    });
  });

  describe('Missing Required Fields', () => {
    it('should reject subscription with missing source', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
      } as any;

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
      try {
        validateNewsletterForm(formData);
      } catch (error) {
        expect((error as ValidationError).field).toBe('source');
      }
    });

    it('should reject subscription with empty source', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        source: '',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize malicious input in name field', () => {
      // Arrange
      const maliciousName = '<script>alert("xss")</script>John';

      // Act
      const sanitized = sanitizeInput(maliciousName);

      // Assert
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).not.toContain('xss');
    });

    it('should sanitize HTML tags in name', () => {
      // Arrange
      const htmlName = '<b>Bold Name</b>';

      // Act
      const sanitized = sanitizeInput(htmlName);

      // Assert
      expect(sanitized).not.toContain('<b>');
      expect(sanitized).not.toContain('</b>');
      expect(sanitized).toBe('Bold Name');
    });

    it('should sanitize malicious input in source field', () => {
      // Arrange
      const maliciousSource = '/services<script>alert(1)</script>';

      // Act
      const sanitized = sanitizeInput(maliciousSource);

      // Assert
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should sanitize email addresses', () => {
      // Arrange
      const email = '  Test@EXAMPLE.COM  ';

      // Act
      const sanitized = sanitizeEmail(email);

      // Assert
      expect(sanitized).toBe('test@example.com');
    });

    it('should remove HTML from email', () => {
      // Arrange
      const maliciousEmail = '<script>test@example.com</script>';

      // Act
      const sanitized = sanitizeEmail(maliciousEmail);

      // Assert
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });
  });

  describe('Name Validation', () => {
    it('should accept valid names', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        name: 'John Doe',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.name).toBe('John Doe');
    });

    it('should accept names with hyphens', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        name: 'Mary-Jane',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.name).toBe('Mary-Jane');
    });

    it('should accept names with apostrophes', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        name: "O'Brien",
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.name).toBe("O'Brien");
    });

    it('should reject names that are too long', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        name: 'A'.repeat(101), // 101 characters
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(formData)).toThrow('100 characters');
    });

    it('should reject names with invalid characters', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        name: 'John123',
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
      expect(() => validateNewsletterForm(formData)).toThrow('invalid characters');
    });

    it('should handle optional name field', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.name).toBeUndefined();
    });

    it('should handle empty name as undefined', () => {
      // Arrange
      const formData = {
        email: 'test@example.com',
        name: '',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.name).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with plus addressing', () => {
      // Arrange
      const formData = {
        email: 'user+tag@example.com',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('user+tag@example.com');
    });

    it('should handle email with subdomain', () => {
      // Arrange
      const formData = {
        email: 'user@mail.example.com',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('user@mail.example.com');
    });

    it('should handle email with dots in local part', () => {
      // Arrange
      const formData = {
        email: 'first.last@example.com',
        source: '/services',
      };

      // Act
      const result = validateNewsletterForm(formData);

      // Assert
      expect(result.email).toBe('first.last@example.com');
    });

    it('should reject email that is too long', () => {
      // Arrange
      const longEmail = 'a'.repeat(250) + '@example.com'; // Over 254 characters
      const formData = {
        email: longEmail,
        source: '/services',
      };

      // Act & Assert
      expect(() => validateNewsletterForm(formData)).toThrow(ValidationError);
    });
  });
});
