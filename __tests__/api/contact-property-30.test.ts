/**
 * Property-Based Test for Invalid Data Rejection
 * 
 * Tests Property 30: Invalid Data Rejection
 * 
 * **Validates: Requirements 11.5**
 * 
 * Requirement 11.5: WHEN invalid data is submitted, 
 * THE System SHALL reject the submission and return a validation error
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { validateContactForm, validateNewsletterForm } from '@/lib/validators';
import { ValidationError } from '@/lib/types';

// ============================================================================
// Property 30: Invalid Data Rejection
// ============================================================================

describe('Property 30: Invalid Data Rejection', () => {
  /**
   * **Validates: Requirements 11.5**
   * 
   * Requirement 11.5: WHEN invalid data is submitted, 
   * THE System SHALL reject the submission and return a validation error
   * 
   * Property: For all invalid data submissions (contact form or newsletter form),
   * when submitted through the validation system, the system SHALL:
   * 1. Reject the submission by throwing a ValidationError
   * 2. Identify the specific invalid field in the error
   * 3. Provide a clear error message describing the validation failure
   * 4. Prevent the invalid data from being processed or stored
   * 
   * This property tests that:
   * 1. Missing required fields are rejected
   * 2. Invalid email formats are rejected
   * 3. Fields that are too short are rejected
   * 4. Fields that are too long are rejected
   * 5. Fields with invalid characters are rejected
   * 6. Empty strings (after trimming) are rejected
   * 7. Null or undefined values are rejected
   * 8. All rejections include proper ValidationError with field identification
   */

  it('should reject contact form submissions with missing required fields', () => {
    fc.assert(
      fc.property(
        // Generate contact form data with at least one missing field
        fc.record({
          name: fc.option(fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2), { nil: undefined }),
          email: fc.option(
            fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            { nil: undefined }
          ),
          subject: fc.option(fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3), { nil: undefined }),
          message: fc.option(fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10), { nil: undefined }),
        })
          .filter(data => {
            // Ensure at least one field is missing
            return !data.name || !data.email || !data.subject || !data.message;
          }),
        (formData) => {
          // Property 1: Validation should throw ValidationError
          expect(() => {
            validateContactForm(formData as any);
          }).toThrow(ValidationError);

          // Property 2: Error should identify the specific invalid field
          try {
            validateContactForm(formData as any);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error field should be one of the required fields
            expect(['name', 'email', 'subject', 'message']).toContain(validationError.field);
            
            // Property 4: Error message should be clear and descriptive
            expect(validationError.message).toBeDefined();
            expect(validationError.message.length).toBeGreaterThan(0);
            expect(validationError.message.toLowerCase()).toMatch(/required|invalid|enter/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject contact form submissions with invalid email formats', () => {
    fc.assert(
      fc.property(
        // Generate contact form data with invalid email
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
          email: fc.constantFrom(
            'invalid-email',
            'no-at-sign',
            '@no-local-part.com',
            'no-domain@',
            'double..dots@example.com',
            'spaces in@email.com',
            'missing-tld@domain',
            '.starts-with-dot@example.com',
            'ends-with-dot.@example.com',
            'user@.starts-with-dot.com',
            'user@ends-with-dot.',
            'user@domain..com',
            'user@@double-at.com',
            '',
            '   ',
          ),
          subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
          message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
        }),
        (formData) => {
          // Property 1: Validation should throw ValidationError for invalid email
          expect(() => {
            validateContactForm(formData);
          }).toThrow(ValidationError);

          // Property 2: Error should identify the email field
          try {
            validateContactForm(formData);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error field should be 'email'
            expect(validationError.field).toBe('email');
            
            // Property 4: Error message should mention email validation
            expect(validationError.message.toLowerCase()).toMatch(/email|required|valid/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject contact form submissions with fields that are too short', () => {
    fc.assert(
      fc.property(
        // Generate contact form data with fields that are too short
        fc.oneof(
          // Name too short (< 2 characters)
          fc.record({
            name: fc.constantFrom('a', 'A', ' a ', '  '),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
            invalidField: fc.constant('name'),
          }),
          // Subject too short (< 3 characters)
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.constantFrom('ab', 'a', 'AB', ' a '),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
            invalidField: fc.constant('subject'),
          }),
          // Message too short (< 10 characters)
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.constantFrom('short', 'hi', 'hello', '123456789'),
            invalidField: fc.constant('message'),
          })
        ),
        ({ invalidField, ...formData }) => {
          // Property 1: Validation should throw ValidationError for too-short fields
          expect(() => {
            validateContactForm(formData);
          }).toThrow(ValidationError);

          // Property 2: Error should identify the specific field
          try {
            validateContactForm(formData);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error field should match the invalid field
            expect(validationError.field).toBe(invalidField);
            
            // Property 4: Error message should mention length requirement
            expect(validationError.message.toLowerCase()).toMatch(/at least|minimum|characters|required/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject contact form submissions with fields that are too long', () => {
    fc.assert(
      fc.property(
        // Generate contact form data with fields that are too long
        fc.oneof(
          // Name too long (> 100 characters)
          fc.record({
            name: fc.string({ minLength: 101, maxLength: 150 }).map(s => 'A' + s.replace(/[^a-zA-Z\s\-']/g, 'a')),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
            invalidField: fc.constant('name'),
          }),
          // Subject too long (> 200 characters)
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.string({ minLength: 201, maxLength: 250 }).map(s => 'Subject ' + s.replace(/[^a-zA-Z0-9\s\-.,!?']/g, 'a')),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
            invalidField: fc.constant('subject'),
          }),
          // Message too long (> 5000 characters)
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.string({ minLength: 5001, maxLength: 5500 }).map(s => 'Message ' + s.replace(/[^a-zA-Z0-9\s\-.,!?'\n]/g, 'a')),
            invalidField: fc.constant('message'),
          })
        ),
        ({ invalidField, ...formData }) => {
          // Property 1: Validation should throw ValidationError for too-long fields
          expect(() => {
            validateContactForm(formData);
          }).toThrow(ValidationError);

          // Property 2: Error should identify the specific field
          try {
            validateContactForm(formData);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error field should match the invalid field
            expect(validationError.field).toBe(invalidField);
            
            // Property 4: Error message should mention length requirement
            expect(validationError.message.toLowerCase()).toMatch(/no more than|maximum|characters/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject newsletter form submissions with invalid data', () => {
    fc.assert(
      fc.property(
        // Generate newsletter form data with various invalid scenarios
        fc.oneof(
          // Missing email
          fc.record({
            email: fc.constant(''),
            source: fc.constant('/services'),
            invalidField: fc.constant('email'),
          }),
          // Invalid email format
          fc.record({
            email: fc.constantFrom('invalid', 'no-at-sign', '@no-local.com', 'no-domain@'),
            source: fc.constant('/services'),
            invalidField: fc.constant('email'),
          }),
          // Missing source
          fc.record({
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            source: fc.constant(''),
            invalidField: fc.constant('source'),
          }),
          // Name too long (optional field, but if provided must be valid)
          fc.record({
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            name: fc.string({ minLength: 101, maxLength: 150 }).map(s => 'A' + s.replace(/[^a-zA-Z\s\-']/g, 'a')),
            source: fc.constant('/services'),
            invalidField: fc.constant('name'),
          })
        ),
        ({ invalidField, ...formData }) => {
          // Property 1: Validation should throw ValidationError
          expect(() => {
            validateNewsletterForm(formData as any);
          }).toThrow(ValidationError);

          // Property 2: Error should identify the specific invalid field
          try {
            validateNewsletterForm(formData as any);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error field should match the invalid field
            expect(validationError.field).toBe(invalidField);
            
            // Property 4: Error message should be clear and descriptive
            expect(validationError.message).toBeDefined();
            expect(validationError.message.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject submissions with empty strings after trimming', () => {
    fc.assert(
      fc.property(
        // Generate contact form data with whitespace-only fields
        fc.oneof(
          // Name is whitespace only
          fc.record({
            name: fc.constantFrom('   ', '\t\t', '\n\n', '  \t  \n  '),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
            invalidField: fc.constant('name'),
          }),
          // Subject is whitespace only
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.constantFrom('   ', '\t\t', '\n\n'),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
            invalidField: fc.constant('subject'),
          }),
          // Message is whitespace only
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.constantFrom('   ', '\t\t\t', '\n\n\n\n'),
            invalidField: fc.constant('message'),
          })
        ),
        ({ invalidField, ...formData }) => {
          // Property 1: Validation should throw ValidationError for whitespace-only fields
          expect(() => {
            validateContactForm(formData);
          }).toThrow(ValidationError);

          // Property 2: Error should identify the specific field
          try {
            validateContactForm(formData);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error field should match the invalid field
            expect(validationError.field).toBe(invalidField);
            
            // Property 4: Error message should mention required field
            expect(validationError.message.toLowerCase()).toMatch(/required|enter/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should prevent invalid data from being processed', () => {
    fc.assert(
      fc.property(
        // Generate various invalid contact form data
        fc.oneof(
          // Missing name
          fc.record({
            name: fc.constant(undefined),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
          }),
          // Invalid email
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.constantFrom('invalid', 'bad@email', '@test.com'),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter(s => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
          }),
          // Field too short
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter(s => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }) => `${localPart}@${domain}.${tld}`)
              .filter(email => !email.includes('..')),
            subject: fc.constantFrom('ab', 'x'),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter(s => s.trim().length >= 10),
          })
        ),
        (formData) => {
          let validationFailed = false;
          let validatedData = null;

          // Property 1: Validation should fail and throw error
          try {
            validatedData = validateContactForm(formData as any);
          } catch (error) {
            validationFailed = true;
            expect(error).toBeInstanceOf(ValidationError);
          }

          // Property 2: Validation should have failed
          expect(validationFailed).toBe(true);

          // Property 3: No validated data should be returned when validation fails
          expect(validatedData).toBeNull();

          // Property 4: Invalid data should not pass validation
          // This ensures the data cannot proceed to storage
          expect(() => {
            validateContactForm(formData as any);
          }).toThrow(ValidationError);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should consistently reject all forms of invalid data', () => {
    fc.assert(
      fc.property(
        // Generate comprehensive invalid data scenarios
        fc.record({
          scenario: fc.constantFrom(
            'missing-name',
            'missing-email',
            'missing-subject',
            'missing-message',
            'invalid-email',
            'name-too-short',
            'subject-too-short',
            'message-too-short',
            'name-too-long',
            'subject-too-long',
            'message-too-long',
            'whitespace-name',
            'whitespace-subject',
            'whitespace-message'
          ),
        }),
        ({ scenario }) => {
          let formData: any;

          // Create form data based on scenario
          const validEmail = 'test@example.com';
          const validName = 'John Doe';
          const validSubject = 'Test Subject';
          const validMessage = 'This is a test message with enough characters';

          switch (scenario) {
            case 'missing-name':
              formData = { email: validEmail, subject: validSubject, message: validMessage };
              break;
            case 'missing-email':
              formData = { name: validName, subject: validSubject, message: validMessage };
              break;
            case 'missing-subject':
              formData = { name: validName, email: validEmail, message: validMessage };
              break;
            case 'missing-message':
              formData = { name: validName, email: validEmail, subject: validSubject };
              break;
            case 'invalid-email':
              formData = { name: validName, email: 'invalid-email', subject: validSubject, message: validMessage };
              break;
            case 'name-too-short':
              formData = { name: 'A', email: validEmail, subject: validSubject, message: validMessage };
              break;
            case 'subject-too-short':
              formData = { name: validName, email: validEmail, subject: 'AB', message: validMessage };
              break;
            case 'message-too-short':
              formData = { name: validName, email: validEmail, subject: validSubject, message: 'Short' };
              break;
            case 'name-too-long':
              formData = { name: 'A'.repeat(101), email: validEmail, subject: validSubject, message: validMessage };
              break;
            case 'subject-too-long':
              formData = { name: validName, email: validEmail, subject: 'S'.repeat(201), message: validMessage };
              break;
            case 'message-too-long':
              formData = { name: validName, email: validEmail, subject: validSubject, message: 'M'.repeat(5001) };
              break;
            case 'whitespace-name':
              formData = { name: '   ', email: validEmail, subject: validSubject, message: validMessage };
              break;
            case 'whitespace-subject':
              formData = { name: validName, email: validEmail, subject: '   ', message: validMessage };
              break;
            case 'whitespace-message':
              formData = { name: validName, email: validEmail, subject: validSubject, message: '   ' };
              break;
          }

          // Property 1: All invalid scenarios should throw ValidationError
          expect(() => {
            validateContactForm(formData);
          }).toThrow(ValidationError);

          // Property 2: Error should be a ValidationError instance
          try {
            validateContactForm(formData);
            fail('Expected ValidationError to be thrown');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            
            const validationError = error as ValidationError;
            
            // Property 3: Error should have a field property
            expect(validationError.field).toBeDefined();
            expect(typeof validationError.field).toBe('string');
            expect(validationError.field.length).toBeGreaterThan(0);
            
            // Property 4: Error should have a message property
            expect(validationError.message).toBeDefined();
            expect(typeof validationError.message).toBe('string');
            expect(validationError.message.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
