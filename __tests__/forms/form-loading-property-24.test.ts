/**
 * Property-Based Test for Form Submission Loading State
 * 
 * Tests Property 24: Form Submission Loading State
 * 
 * **Validates: Requirements 9.2**
 * 
 * Requirement 9.2: WHEN a form is being submitted, THE System SHALL disable 
 * the submit button and show a loading state
 */

/**
 * @jest-environment jsdom
 */

import * as fc from 'fast-check';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsletterForm } from '@/components/newsletter-form';
import ContactPage from '@/app/contact/page';

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// ============================================================================
// Property 24: Form Submission Loading State
// ============================================================================

describe('Property 24: Form Submission Loading State', () => {
  /**
   * **Validates: Requirements 9.2**
   * 
   * Requirement 9.2: WHEN a form is being submitted, THE System SHALL disable 
   * the submit button and show a loading state
   * 
   * Property: For all form submissions (newsletter and contact forms), when the 
   * form is being submitted, the system SHALL:
   * 1. Disable the submit button to prevent duplicate submissions
   * 2. Display a loading indicator (spinner or loading text)
   * 3. Change the button text to indicate submission is in progress
   * 4. Disable all form inputs to prevent changes during submission
   * 5. Maintain the loading state until submission completes or fails
   * 
   * This property tests that:
   * 1. Submit button is disabled during submission
   * 2. Loading indicator is visible during submission
   * 3. Button text changes to loading state
   * 4. Form inputs are disabled during submission
   * 5. Loading state is consistent across different form types
   */

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock fetch to simulate slow API response
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should disable submit button and show loading state for newsletter form during submission', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid newsletter form data
        fc.record({
          email: fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
            tld: fc.constantFrom('com', 'org', 'net', 'edu', 'io'),
          })
            .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => 
              `${localPart}@${domain}.${tld}`
            )
            .filter((email: string) => !email.includes('..')),
          name: fc.option(
            fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter((s: string) => s.trim().length >= 2),
            { nil: undefined }
          ),
          source: fc.constantFrom('/services', '/about', '/blog', '/contact', '/'),
          responseDelay: fc.integer({ min: 100, max: 500 }), // Simulate API delay
        }),
        async ({ email, name, source, responseDelay }) => {
          // Mock fetch to simulate slow API response
          (global.fetch as jest.Mock).mockImplementation(() =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                });
              }, responseDelay)
            )
          );

          // Render the newsletter form
          const user = userEvent.setup();
          render(<NewsletterForm source={source} />);

          // Fill in the form
          const emailInput = screen.getByLabelText(/email address/i);
          await user.type(emailInput, email);

          if (name) {
            const nameInput = screen.getByLabelText(/name/i);
            await user.type(nameInput, name);
          }

          // Get the submit button
          const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

          // Property 1: Button should be enabled before submission
          expect(submitButton).toBeEnabled();
          expect(submitButton).not.toHaveAttribute('disabled');

          // Property 2: Button should show default text before submission
          expect(submitButton).toHaveTextContent(/subscribe to newsletter/i);
          expect(submitButton).not.toHaveTextContent(/subscribing/i);

          // Property 3: Email input should be enabled before submission
          expect(emailInput).toBeEnabled();

          // Submit the form
          await user.click(submitButton);

          // Property 4: Button should be disabled immediately after submission starts
          await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveAttribute('disabled');
          });

          // Property 5: Button should show loading text during submission
          await waitFor(() => {
            expect(submitButton).toHaveTextContent(/subscribing/i);
          });

          // Property 6: Loading indicator (spinner) should be visible
          await waitFor(() => {
            const spinner = submitButton.querySelector('svg.animate-spin');
            expect(spinner).toBeInTheDocument();
          });

          // Property 7: Form inputs should be disabled during submission
          await waitFor(() => {
            expect(emailInput).toBeDisabled();
            expect(emailInput).toHaveAttribute('disabled');
          });

          // Property 8: Button should not show default text during submission
          expect(submitButton).not.toHaveTextContent(/^subscribe to newsletter$/i);

          // Wait for submission to complete
          await waitFor(
            () => {
              expect(submitButton).toBeEnabled();
            },
            { timeout: responseDelay + 1000 }
          );

          // Property 9: After submission, button should be re-enabled
          expect(submitButton).toBeEnabled();
          expect(submitButton).not.toHaveAttribute('disabled');

          // Property 10: After submission, inputs should be re-enabled
          expect(emailInput).toBeEnabled();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should disable submit button and show loading state for contact form during submission', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid contact form data
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter((s: string) => s.trim().length >= 2),
          email: fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
            tld: fc.constantFrom('com', 'org', 'net', 'edu', 'io'),
          })
            .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => 
              `${localPart}@${domain}.${tld}`
            )
            .filter((email: string) => !email.includes('..')),
          subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter((s: string) => s.trim().length >= 3),
          message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter((s: string) => s.trim().length >= 10),
          responseDelay: fc.integer({ min: 100, max: 500 }), // Simulate API delay
        }),
        async ({ name, email, subject, message, responseDelay }) => {
          // Mock fetch to simulate slow API response
          (global.fetch as jest.Mock).mockImplementation(() =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                });
              }, responseDelay)
            )
          );

          // Render the contact page
          const user = userEvent.setup();
          render(<ContactPage />);

          // Fill in the form
          const nameInput = screen.getByLabelText(/^name/i);
          const emailInput = screen.getByLabelText(/^email/i);
          const subjectInput = screen.getByLabelText(/subject/i);
          const messageInput = screen.getByLabelText(/message/i);

          await user.type(nameInput, name);
          await user.type(emailInput, email);
          await user.type(subjectInput, subject);
          await user.type(messageInput, message);

          // Get the submit button
          const submitButton = screen.getByRole('button', { name: /send message/i });

          // Property 1: Button should be enabled before submission
          expect(submitButton).toBeEnabled();
          expect(submitButton).not.toHaveAttribute('disabled');

          // Property 2: Button should show default text before submission
          expect(submitButton).toHaveTextContent(/send message/i);
          expect(submitButton).not.toHaveTextContent(/sending/i);

          // Property 3: All inputs should be enabled before submission
          expect(nameInput).toBeEnabled();
          expect(emailInput).toBeEnabled();
          expect(subjectInput).toBeEnabled();
          expect(messageInput).toBeEnabled();

          // Submit the form
          await user.click(submitButton);

          // Property 4: Button should be disabled immediately after submission starts
          await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveAttribute('disabled');
          });

          // Property 5: Button should show loading text during submission
          await waitFor(() => {
            expect(submitButton).toHaveTextContent(/sending/i);
          });

          // Property 6: Loading indicator (spinner) should be visible
          await waitFor(() => {
            const spinner = submitButton.querySelector('svg.animate-spin');
            expect(spinner).toBeInTheDocument();
          });

          // Property 7: All form inputs should be disabled during submission
          await waitFor(() => {
            expect(nameInput).toBeDisabled();
            expect(emailInput).toBeDisabled();
            expect(subjectInput).toBeDisabled();
            expect(messageInput).toBeDisabled();
          });

          // Property 8: Button should not show default text during submission
          expect(submitButton).not.toHaveTextContent(/^send message$/i);

          // Wait for submission to complete
          await waitFor(
            () => {
              expect(submitButton).toBeEnabled();
            },
            { timeout: responseDelay + 1000 }
          );

          // Property 9: After submission, button should be re-enabled
          expect(submitButton).toBeEnabled();
          expect(submitButton).not.toHaveAttribute('disabled');

          // Property 10: After submission, all inputs should be re-enabled
          expect(nameInput).toBeEnabled();
          expect(emailInput).toBeEnabled();
          expect(subjectInput).toBeEnabled();
          expect(messageInput).toBeEnabled();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain loading state consistency across multiple submission attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid newsletter form data
        fc.record({
          email: fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
            tld: fc.constantFrom('com', 'org', 'net'),
          })
            .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => 
              `${localPart}@${domain}.${tld}`
            )
            .filter((email: string) => !email.includes('..')),
          source: fc.constantFrom('/services', '/about'),
          responseDelay: fc.integer({ min: 100, max: 300 }),
        }),
        async ({ email, source, responseDelay }) => {
          // Mock fetch to simulate API response
          (global.fetch as jest.Mock).mockImplementation(() =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                });
              }, responseDelay)
            )
          );

          // Render the newsletter form
          const user = userEvent.setup();
          render(<NewsletterForm source={source} />);

          // Fill in the form
          const emailInput = screen.getByLabelText(/email address/i);
          await user.type(emailInput, email);

          // Get the submit button
          const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

          // Submit the form
          await user.click(submitButton);

          // Property 1: During submission, button should be disabled
          await waitFor(() => {
            expect(submitButton).toBeDisabled();
          });

          // Property 2: During submission, loading text should be visible
          await waitFor(() => {
            expect(submitButton).toHaveTextContent(/subscribing/i);
          });

          // Property 3: During submission, spinner should be visible
          await waitFor(() => {
            const spinner = submitButton.querySelector('svg.animate-spin');
            expect(spinner).toBeInTheDocument();
          });

          // Property 4: Loading state should persist throughout submission
          const checkLoadingState = () => {
            if (submitButton.hasAttribute('disabled')) {
              expect(submitButton).toHaveTextContent(/subscribing/i);
              const spinner = submitButton.querySelector('svg.animate-spin');
              expect(spinner).toBeInTheDocument();
            }
          };

          // Check loading state multiple times during submission
          checkLoadingState();
          await new Promise(resolve => setTimeout(resolve, responseDelay / 3));
          checkLoadingState();
          await new Promise(resolve => setTimeout(resolve, responseDelay / 3));
          checkLoadingState();

          // Wait for submission to complete
          await waitFor(
            () => {
              expect(submitButton).toBeEnabled();
            },
            { timeout: responseDelay + 1000 }
          );

          // Property 5: After completion, loading state should be removed
          expect(submitButton).not.toHaveTextContent(/subscribing/i);
          expect(submitButton).toHaveTextContent(/subscribe to newsletter/i);
          
          const spinner = submitButton.querySelector('svg.animate-spin');
          expect(spinner).not.toBeInTheDocument();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should show loading state even when submission fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid contact form data
        fc.record({
          name: fc.stringMatching(/^[a-zA-Z][a-zA-Z\s\-']{1,99}$/).filter((s: string) => s.trim().length >= 2),
          email: fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
            tld: fc.constantFrom('com', 'org', 'net'),
          })
            .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => 
              `${localPart}@${domain}.${tld}`
            )
            .filter((email: string) => !email.includes('..')),
          subject: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?']{2,199}$/).filter((s: string) => s.trim().length >= 3),
          message: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9\s\-.,!?'\n]{9,499}$/).filter((s: string) => s.trim().length >= 10),
          errorStatus: fc.constantFrom(400, 500, 503, 429),
          responseDelay: fc.integer({ min: 100, max: 300 }),
        }),
        async ({ name, email, subject, message, errorStatus, responseDelay }) => {
          // Mock fetch to simulate failed API response
          (global.fetch as jest.Mock).mockImplementation(() =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve({
                  ok: false,
                  status: errorStatus,
                  json: async () => ({ 
                    success: false, 
                    error: 'An error occurred' 
                  }),
                });
              }, responseDelay)
            )
          );

          // Render the contact page
          const user = userEvent.setup();
          render(<ContactPage />);

          // Fill in the form
          const nameInput = screen.getByLabelText(/^name/i);
          const emailInput = screen.getByLabelText(/^email/i);
          const subjectInput = screen.getByLabelText(/subject/i);
          const messageInput = screen.getByLabelText(/message/i);

          await user.type(nameInput, name);
          await user.type(emailInput, email);
          await user.type(subjectInput, subject);
          await user.type(messageInput, message);

          // Get the submit button
          const submitButton = screen.getByRole('button', { name: /send message/i });

          // Submit the form
          await user.click(submitButton);

          // Property 1: Button should be disabled during failed submission
          await waitFor(() => {
            expect(submitButton).toBeDisabled();
          });

          // Property 2: Loading text should be visible during failed submission
          await waitFor(() => {
            expect(submitButton).toHaveTextContent(/sending/i);
          });

          // Property 3: Spinner should be visible during failed submission
          await waitFor(() => {
            const spinner = submitButton.querySelector('svg.animate-spin');
            expect(spinner).toBeInTheDocument();
          });

          // Property 4: Inputs should be disabled during failed submission
          await waitFor(() => {
            expect(nameInput).toBeDisabled();
            expect(emailInput).toBeDisabled();
            expect(subjectInput).toBeDisabled();
            expect(messageInput).toBeDisabled();
          });

          // Wait for submission to complete (with error)
          await waitFor(
            () => {
              expect(submitButton).toBeEnabled();
            },
            { timeout: responseDelay + 1000 }
          );

          // Property 5: After error, button should be re-enabled
          expect(submitButton).toBeEnabled();

          // Property 6: After error, loading state should be removed
          expect(submitButton).not.toHaveTextContent(/sending/i);
          expect(submitButton).toHaveTextContent(/send message/i);

          // Property 7: After error, inputs should be re-enabled
          expect(nameInput).toBeEnabled();
          expect(emailInput).toBeEnabled();
          expect(subjectInput).toBeEnabled();
          expect(messageInput).toBeEnabled();
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should prevent duplicate submissions while loading state is active', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid newsletter form data
        fc.record({
          email: fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
            tld: fc.constantFrom('com', 'org', 'net'),
          })
            .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => 
              `${localPart}@${domain}.${tld}`
            )
            .filter((email: string) => !email.includes('..')),
          source: fc.constantFrom('/services', '/about'),
          responseDelay: fc.integer({ min: 200, max: 500 }),
        }),
        async ({ email, source, responseDelay }) => {
          let fetchCallCount = 0;

          // Mock fetch to count calls and simulate slow response
          (global.fetch as jest.Mock).mockImplementation(() => {
            fetchCallCount++;
            return new Promise((resolve) =>
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                });
              }, responseDelay)
            );
          });

          // Render the newsletter form
          const user = userEvent.setup();
          render(<NewsletterForm source={source} />);

          // Fill in the form
          const emailInput = screen.getByLabelText(/email address/i);
          await user.type(emailInput, email);

          // Get the submit button
          const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

          // Submit the form
          await user.click(submitButton);

          // Wait for loading state to be active
          await waitFor(() => {
            expect(submitButton).toBeDisabled();
          });

          // Property 1: Button should be disabled, preventing clicks
          expect(submitButton).toBeDisabled();

          // Try to click the button again while it's disabled
          // This should not trigger another submission
          await user.click(submitButton);
          await user.click(submitButton);
          await user.click(submitButton);

          // Property 2: Only one fetch call should have been made
          // (disabled button prevents duplicate submissions)
          expect(fetchCallCount).toBe(1);

          // Wait for submission to complete
          await waitFor(
            () => {
              expect(submitButton).toBeEnabled();
            },
            { timeout: responseDelay + 1000 }
          );

          // Property 3: After completion, still only one fetch call
          expect(fetchCallCount).toBe(1);
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should display loading state with proper accessibility attributes', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid newsletter form data
        fc.record({
          email: fc.record({
            localPart: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9.+_-]{0,18}[a-zA-Z0-9]$/),
            domain: fc.stringMatching(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,18}[a-zA-Z0-9]$/),
            tld: fc.constantFrom('com', 'org', 'net'),
          })
            .map(({ localPart, domain, tld }: { localPart: string; domain: string; tld: string }) => 
              `${localPart}@${domain}.${tld}`
            )
            .filter((email: string) => !email.includes('..')),
          source: fc.constantFrom('/services', '/about'),
          responseDelay: fc.integer({ min: 100, max: 300 }),
        }),
        async ({ email, source, responseDelay }) => {
          // Mock fetch to simulate slow API response
          (global.fetch as jest.Mock).mockImplementation(() =>
            new Promise((resolve) =>
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                });
              }, responseDelay)
            )
          );

          // Render the newsletter form
          const user = userEvent.setup();
          render(<NewsletterForm source={source} />);

          // Fill in the form
          const emailInput = screen.getByLabelText(/email address/i);
          await user.type(emailInput, email);

          // Get the submit button
          const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i });

          // Submit the form
          await user.click(submitButton);

          // Property 1: Button should have disabled attribute
          await waitFor(() => {
            expect(submitButton).toHaveAttribute('disabled');
          });

          // Property 2: Spinner should have aria-hidden attribute
          await waitFor(() => {
            const spinner = submitButton.querySelector('svg.animate-spin');
            expect(spinner).toHaveAttribute('aria-hidden', 'true');
          });

          // Property 3: Button should still be accessible via role
          expect(submitButton).toHaveAttribute('type', 'submit');

          // Property 4: Input should have disabled attribute
          await waitFor(() => {
            expect(emailInput).toHaveAttribute('disabled');
          });

          // Wait for submission to complete
          await waitFor(
            () => {
              expect(submitButton).toBeEnabled();
            },
            { timeout: responseDelay + 1000 }
          );
        }
      ),
      { numRuns: 30 }
    );
  });
});
