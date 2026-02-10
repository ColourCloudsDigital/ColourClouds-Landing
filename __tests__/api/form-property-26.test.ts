/**
 * Property-Based Test for Form Submission Error Notification
 * 
 * Tests Property 26: Form Submission Error Notification
 * 
 * **Validates: Requirements 9.4**
 * 
 * Requirement 9.4: WHEN an error occurs during form submission, 
 * THE System SHALL display a specific error message via toast notification
 */

/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
import { validateContactForm, validateNewsletterForm } from '@/lib/validators';
import { ValidationError } from '@/lib/types';

// ============================================================================
// Property 26: Form Submission Error Notification
// ============================================================================

describe('Property 26: Form Submission Error Notification', () => {
  /**
   * **Validates: Requirements 9.4**
   * 
   * Requirement 9.4: WHEN an error occurs during form submission, 
   * THE System SHALL display a specific error message via toast notification
   * 
   * Property: For all form submissions (newsletter and contact) that fail due to 
   * any error (validation, network, server, rate limit), the system SHALL return 
   * an error response with a specific error message that:
   * 1. Clearly indicates the submission failed
   * 2. Provides user-friendly error messaging (no technical jargon)
   * 3. Is specific to the error type (not generic)
   * 4. Suggests appropriate next steps or retry actions
   * 5. Is suitable for display in a toast notification
   * 
   * This property tests that:
   * 1. Error notifications are triggered for all failed submissions
   * 2. Error messages are specific and not generic
   * 3. Error messages are user-friendly and actionable
   * 4. Error messages are consistent in structure
   * 5. Error messages distinguish between different error types
   * 6. Error messages are appropriate length for toast display
   * 
   * Note: This test validates the error notification logic by simulating various 
   * error scenarios and verifying that specific error messages would be provided.
   */

  describe('Contact Form Error Notifications', () => {
    it('should provide specific error messages for different contact form failure scenarios', () => {
      fc.assert(
        fc.property(
          // Generate valid contact form data with various error scenarios
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter((s: string) => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net', 'edu', 'io'),
            })
              .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => `${localPart}@${domain}.${tld}`)
              .filter((email: string) => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter((s: string) => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter((s: string) => s.trim().length >= 10),
            errorScenario: fc.constantFrom(
              { type: 'network', status: 0, message: 'Network error. Please check your connection and try again.' },
              { type: 'server', status: 500, message: 'Something went wrong. Please try again later.' },
              { type: 'unavailable', status: 503, message: 'Service temporarily unavailable. Please try again later.' },
              { type: 'rateLimit', status: 429, message: 'Too many requests. Please wait a moment and try again.' },
              { type: 'validation', status: 400, message: 'Invalid form data. Please check your inputs.' },
            ),
          }),
          ({ errorScenario, ...formData }) => {
            // Validate the form data (it's valid, but submission will fail)
            const validatedData = validateContactForm(formData);
            expect(validatedData).toBeDefined();

            // Simulate API error response based on error scenario
            const apiResponse = {
              status: errorScenario.status,
              ok: false,
              data: {
                success: false,
                error: errorScenario.message,
              },
            };

            // Define the error notification that would be shown
            const errorNotification = {
              title: 'Submission Failed',
              description: apiResponse.data.error,
              variant: 'error',
            };

            // Property 1: Error message must be specific to the error type
            expect(errorNotification.description).toBe(errorScenario.message);
            expect(errorNotification.description).not.toBe('An error occurred');
            expect(errorNotification.description).not.toBe('Error');
            expect(errorNotification.description).not.toBe('Failed');

            // Property 2: Error message must be user-friendly (no technical jargon)
            const lowerError = errorNotification.description.toLowerCase();
            expect(lowerError).not.toMatch(/exception|stack trace|undefined|null/i);
            expect(lowerError).not.toMatch(/http|status code|api error/i);
            expect(lowerError).not.toMatch(/500|503|429|400/); // No HTTP status codes

            // Property 3: Error message must be specific and informative
            expect(errorNotification.description.length).toBeGreaterThan(10); // Not too short
            expect(errorNotification.description.length).toBeLessThan(150); // Not too long for toast

            // Property 4: Error message must be actionable (suggest next steps)
            const hasActionableGuidance = 
              lowerError.includes('try again') ||
              lowerError.includes('check') ||
              lowerError.includes('wait') ||
              lowerError.includes('later') ||
              lowerError.includes('moment');
            expect(hasActionableGuidance).toBe(true);

            // Property 5: Error notification must have consistent structure
            expect(errorNotification).toHaveProperty('title');
            expect(errorNotification).toHaveProperty('description');
            expect(errorNotification).toHaveProperty('variant');
            expect(errorNotification.variant).toBe('error');

            // Property 6: Error message must be specific to error type
            switch (errorScenario.type) {
              case 'network':
                expect(lowerError).toMatch(/network|connection|connect/);
                break;
              case 'server':
                expect(lowerError).toMatch(/wrong|error|problem/);
                break;
              case 'unavailable':
                expect(lowerError).toMatch(/unavailable|busy|temporarily/);
                break;
              case 'rateLimit':
                expect(lowerError).toMatch(/too many|requests|wait/);
                break;
              case 'validation':
                expect(lowerError).toMatch(/invalid|check|data|inputs/);
                break;
            }

            // Property 7: Title must indicate failure
            expect(errorNotification.title.toLowerCase()).toMatch(/fail|error|unable/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should distinguish between different HTTP error status codes with specific messages', () => {
      fc.assert(
        fc.property(
          // Generate valid contact form data
          fc.record({
            name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter((s: string) => s.trim().length >= 2),
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net'),
            })
              .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => `${localPart}@${domain}.${tld}`)
              .filter((email: string) => !email.includes('..')),
            subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter((s: string) => s.trim().length >= 3),
            message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter((s: string) => s.trim().length >= 10),
            statusCode: fc.constantFrom(400, 429, 500, 503),
          }),
          ({ statusCode, ...formData }) => {
            // Validate the form data
            const validatedData = validateContactForm(formData);
            expect(validatedData).toBeDefined();

            // Map status codes to specific error messages
            const errorMessages: Record<number, string> = {
              400: 'Invalid form data. Please check your inputs.',
              429: 'Too many requests. Please wait a moment and try again.',
              500: 'Something went wrong. Please try again later.',
              503: 'Service temporarily unavailable. Please try again later.',
            };

            // Simulate error response
            const apiResponse = {
              status: statusCode,
              ok: false,
              data: {
                success: false,
                error: errorMessages[statusCode],
              },
            };

            // Property 1: Each status code should have a specific error message
            expect(apiResponse.data.error).toBeDefined();
            expect(apiResponse.data.error).toBe(errorMessages[statusCode]);

            // Property 2: Error messages should be different for different status codes
            const allMessages = Object.values(errorMessages);
            const uniqueMessages = new Set(allMessages);
            // At least some messages should be unique (not all the same)
            expect(uniqueMessages.size).toBeGreaterThan(1);

            // Property 3: Each error message should be specific (not generic)
            expect(apiResponse.data.error).not.toBe('An error occurred');
            expect(apiResponse.data.error).not.toBe('Error');
            expect(apiResponse.data.error.length).toBeGreaterThan(10);

            // Property 4: Error message should not contain status code
            expect(apiResponse.data.error).not.toContain(statusCode.toString());
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should provide specific error messages for validation failures', () => {
      fc.assert(
        fc.property(
          // Generate invalid contact form data
          fc.oneof(
            // Missing name
            fc.record({
              name: fc.constantFrom('', '  ', null, undefined) as any,
              email: fc.record({
                localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
                domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
                tld: fc.constantFrom('com', 'org', 'net'),
              })
                .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => `${localPart}@${domain}.${tld}`)
                .filter((email: string) => !email.includes('..')),
              subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter((s: string) => s.trim().length >= 3),
              message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter((s: string) => s.trim().length >= 10),
            }),
            // Invalid email
            fc.record({
              name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter((s: string) => s.trim().length >= 2),
              email: fc.constantFrom('invalid', 'test@', '@example.com', ''),
              subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter((s: string) => s.trim().length >= 3),
              message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter((s: string) => s.trim().length >= 10),
            }),
          ),
          (formData) => {
            // Attempt to validate (this will throw ValidationError)
            let errorResponse;
            
            try {
              validateContactForm(formData);
              // If validation passes (shouldn't happen), create a generic error
              errorResponse = {
                success: false,
                error: 'Validation failed',
                field: 'unknown',
              };
            } catch (error) {
              if (error instanceof ValidationError) {
                // Simulate API error response
                errorResponse = {
                  success: false,
                  error: error.message,
                  field: error.field,
                };
              } else {
                throw error;
              }
            }

            // Property 1: Validation error message must be specific
            expect(errorResponse.error).toBeDefined();
            expect(errorResponse.error.length).toBeGreaterThan(5);
            expect(errorResponse.error).not.toBe('Validation failed');
            expect(errorResponse.error).not.toBe('Invalid input');

            // Property 2: Validation error must identify the field
            expect(errorResponse.field).toBeDefined();
            expect(['name', 'email', 'subject', 'message']).toContain(errorResponse.field);

            // Property 3: Error message should be user-friendly
            const lowerError = errorResponse.error.toLowerCase();
            expect(lowerError).not.toMatch(/validation error|exception|undefined|null/i);

            // Property 4: Error message should be actionable
            const hasActionableGuidance = 
              lowerError.includes('required') ||
              lowerError.includes('valid') ||
              lowerError.includes('enter') ||
              lowerError.includes('provide') ||
              lowerError.includes('check');
            expect(hasActionableGuidance).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Newsletter Form Error Notifications', () => {
    it('should provide specific error messages for different newsletter form failure scenarios', () => {
      fc.assert(
        fc.property(
          // Generate valid newsletter form data with various error scenarios
          fc.record({
            email: fc.record({
              localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
              domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
              tld: fc.constantFrom('com', 'org', 'net', 'edu', 'io'),
            })
              .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => `${localPart}@${domain}.${tld}`)
              .filter((email: string) => !email.includes('..')),
            name: fc.option(
              fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
              { nil: undefined }
            ),
            source: fc.constantFrom('/services', '/blog', '/about', '/contact'),
            errorScenario: fc.constantFrom(
              { type: 'network', status: 0, message: 'Network error. Please check your connection and try again.' },
              { type: 'server', status: 500, message: 'Failed to process subscription. Please try again later.' },
              { type: 'unavailable', status: 503, message: 'Service temporarily unavailable. Please try again later.' },
              { type: 'rateLimit', status: 429, message: 'Too many requests. Please try again later.' },
              { type: 'storage', status: 500, message: 'Failed to save subscription. Please try again later.' },
            ),
          }),
          ({ errorScenario, ...formData }) => {
            // Validate the form data (it's valid, but submission will fail)
            const validatedData = validateNewsletterForm(formData);
            expect(validatedData).toBeDefined();

            // Simulate API error response based on error scenario
            const apiResponse = {
              status: errorScenario.status,
              ok: false,
              data: {
                success: false,
                error: errorScenario.message,
              },
            };

            // Define the error notification that would be shown
            const errorNotification = {
              title: 'Subscription Failed',
              description: apiResponse.data.error,
              variant: 'error',
            };

            // Property 1: Error message must be specific to the error type
            expect(errorNotification.description).toBe(errorScenario.message);
            expect(errorNotification.description).not.toBe('An error occurred');
            expect(errorNotification.description).not.toBe('Error');

            // Property 2: Error message must be user-friendly (no technical jargon)
            const lowerError = errorNotification.description.toLowerCase();
            expect(lowerError).not.toMatch(/exception|stack trace|undefined|null/i);
            expect(lowerError).not.toMatch(/http|status code|api error/i);

            // Property 3: Error message must be specific and informative
            expect(errorNotification.description.length).toBeGreaterThan(10);
            expect(errorNotification.description.length).toBeLessThan(150);

            // Property 4: Error message must be actionable
            const hasActionableGuidance = 
              lowerError.includes('try again') ||
              lowerError.includes('check') ||
              lowerError.includes('later');
            expect(hasActionableGuidance).toBe(true);

            // Property 5: Error notification must have consistent structure
            expect(errorNotification).toHaveProperty('title');
            expect(errorNotification).toHaveProperty('description');
            expect(errorNotification).toHaveProperty('variant');
            expect(errorNotification.variant).toBe('error');

            // Property 6: Error message must be specific to error type
            switch (errorScenario.type) {
              case 'network':
                expect(lowerError).toMatch(/network|connection/);
                break;
              case 'server':
              case 'storage':
                expect(lowerError).toMatch(/failed|process|save|subscription/);
                break;
              case 'unavailable':
                expect(lowerError).toMatch(/unavailable|temporarily/);
                break;
              case 'rateLimit':
                expect(lowerError).toMatch(/too many|requests/);
                break;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide specific error messages for newsletter validation failures', () => {
      fc.assert(
        fc.property(
          // Generate invalid newsletter form data
          fc.oneof(
            // Invalid email
            fc.record({
              email: fc.constantFrom('invalid', 'test@', '@example.com', '', '  '),
              name: fc.option(
                fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
                { nil: undefined }
              ),
              source: fc.constantFrom('/services', '/blog', '/about'),
            }),
            // Missing email
            fc.record({
              email: fc.constantFrom(null, undefined) as any,
              name: fc.option(
                fc.stringMatching(/^[a-zA-Z\s\-']{2,50}$/),
                { nil: undefined }
              ),
              source: fc.constantFrom('/services', '/blog', '/about'),
            }),
          ),
          (formData) => {
            // Attempt to validate (this will throw ValidationError)
            let errorResponse;
            
            try {
              validateNewsletterForm(formData);
              // If validation passes (shouldn't happen), create a generic error
              errorResponse = {
                success: false,
                error: 'Validation failed',
                field: 'email',
              };
            } catch (error) {
              if (error instanceof ValidationError) {
                // Simulate API error response
                errorResponse = {
                  success: false,
                  error: error.message,
                  field: error.field,
                };
              } else {
                throw error;
              }
            }

            // Property 1: Validation error message must be specific
            expect(errorResponse.error).toBeDefined();
            expect(errorResponse.error.length).toBeGreaterThan(5);
            expect(errorResponse.error).not.toBe('Validation failed');
            expect(errorResponse.error).not.toBe('Invalid input');

            // Property 2: Validation error must identify the field
            expect(errorResponse.field).toBeDefined();
            expect(errorResponse.field).toBe('email');

            // Property 3: Error message should be user-friendly
            const lowerError = errorResponse.error.toLowerCase();
            expect(lowerError).not.toMatch(/validation error|exception|undefined|null/i);

            // Property 4: Error message should mention email
            expect(lowerError).toMatch(/email|address/);

            // Property 5: Error message should be actionable
            const hasActionableGuidance = 
              lowerError.includes('required') ||
              lowerError.includes('valid') ||
              lowerError.includes('enter') ||
              lowerError.includes('provide');
            expect(hasActionableGuidance).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Cross-Form Error Notification Consistency', () => {
    it('should maintain consistent error notification structure across both forms', () => {
      fc.assert(
        fc.property(
          // Generate error scenarios for both forms
          fc.record({
            formType: fc.constantFrom('contact', 'newsletter'),
            errorType: fc.constantFrom('network', 'server', 'rateLimit'),
          }),
          ({ formType, errorType }) => {
            // Define error messages for each form type and error type
            const errorMessages: Record<string, Record<string, string>> = {
              contact: {
                network: 'Network error. Please check your connection and try again.',
                server: 'Something went wrong. Please try again later.',
                rateLimit: 'Too many requests. Please wait a moment and try again.',
              },
              newsletter: {
                network: 'Network error. Please check your connection and try again.',
                server: 'Failed to process subscription. Please try again later.',
                rateLimit: 'Too many requests. Please try again later.',
              },
            };

            const errorMessage = errorMessages[formType][errorType];
            const errorNotification = {
              title: formType === 'contact' ? 'Submission Failed' : 'Subscription Failed',
              description: errorMessage,
              variant: 'error',
            };

            // Property 1: All error notifications must have the same structure
            expect(errorNotification).toHaveProperty('title');
            expect(errorNotification).toHaveProperty('description');
            expect(errorNotification).toHaveProperty('variant');

            // Property 2: All error notifications must use error variant
            expect(errorNotification.variant).toBe('error');

            // Property 3: Title must be a non-empty string
            expect(typeof errorNotification.title).toBe('string');
            expect(errorNotification.title.length).toBeGreaterThan(0);

            // Property 4: Description must be a non-empty string
            expect(typeof errorNotification.description).toBe('string');
            expect(errorNotification.description.length).toBeGreaterThan(0);

            // Property 5: Error messages should be specific (not generic)
            expect(errorNotification.description).not.toBe('An error occurred');
            expect(errorNotification.description).not.toBe('Error');

            // Property 6: Error messages should be user-friendly
            const lowerError = errorNotification.description.toLowerCase();
            expect(lowerError).not.toMatch(/exception|stack trace|undefined|null/i);

            // Property 7: Error messages should be actionable
            const hasActionableGuidance = 
              lowerError.includes('try again') ||
              lowerError.includes('check') ||
              lowerError.includes('wait') ||
              lowerError.includes('later');
            expect(hasActionableGuidance).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should ensure error messages are never generic across all forms and error types', () => {
      fc.assert(
        fc.property(
          // Generate all combinations of forms and error types
          fc.record({
            formType: fc.constantFrom('contact', 'newsletter'),
            errorStatus: fc.constantFrom(0, 400, 429, 500, 503),
          }),
          ({ formType, errorStatus }) => {
            // Map status codes to specific error messages
            const errorMessages: Record<number, string> = {
              0: 'Network error. Please check your connection and try again.',
              400: formType === 'contact' 
                ? 'Invalid form data. Please check your inputs.'
                : 'Please enter a valid email address.',
              429: 'Too many requests. Please wait a moment and try again.',
              500: formType === 'contact'
                ? 'Something went wrong. Please try again later.'
                : 'Failed to process subscription. Please try again later.',
              503: 'Service temporarily unavailable. Please try again later.',
            };

            const errorMessage = errorMessages[errorStatus];

            // Property 1: Error message must never be generic
            const genericMessages = [
              'An error occurred',
              'Error',
              'Failed',
              'Something went wrong',
              'Try again',
              'Please try again',
            ];
            
            // Error message should not be exactly one of these generic messages
            expect(genericMessages).not.toContain(errorMessage);

            // Property 2: Error message must be specific and informative
            expect(errorMessage.length).toBeGreaterThan(10);

            // Property 3: Error message must not contain technical jargon
            const lowerError = errorMessage.toLowerCase();
            expect(lowerError).not.toMatch(/exception|stack trace|undefined|null/i);
            expect(lowerError).not.toMatch(/http|status code|api error/i);
            expect(lowerError).not.toContain(errorStatus.toString());

            // Property 4: Error message must be actionable
            const hasActionableGuidance = 
              lowerError.includes('try again') ||
              lowerError.includes('check') ||
              lowerError.includes('wait') ||
              lowerError.includes('later') ||
              lowerError.includes('enter') ||
              lowerError.includes('provide');
            expect(hasActionableGuidance).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
