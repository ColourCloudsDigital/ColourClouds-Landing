/**
 * Unit Tests for Newsletter Form Component
 * 
 * Tests cover:
 * - Form rendering
 * - Client-side validation
 * - Form submission
 * - Loading states
 * - Error handling
 * - Success handling
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.6, 3.7, 9.2, 9.4
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewsletterForm } from '../newsletter-form'
import { toast } from 'sonner'

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('NewsletterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('should render the form with all required fields', () => {
      render(<NewsletterForm source="/test" />)

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /subscribe to newsletter/i })).toBeInTheDocument()
    })

    it('should mark email field as required', () => {
      render(<NewsletterForm source="/test" />)

      const emailLabel = screen.getByText(/email address/i)
      expect(emailLabel).toHaveTextContent('*')
    })

    it('should mark name field as optional', () => {
      render(<NewsletterForm source="/test" />)

      const nameLabel = screen.getByText(/name/i)
      expect(nameLabel).toHaveTextContent('(optional)')
    })

    it('should display privacy notice', () => {
      render(<NewsletterForm source="/test" />)

      expect(screen.getByText(/we respect your privacy/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Client-side Validation', () => {
    it('should show error when email is empty on submit', async () => {
      render(<NewsletterForm source="/test" />)

      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should show error when email format is invalid', async () => {
      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'invalid-email')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should show error when name contains invalid characters', async () => {
      render(<NewsletterForm source="/test" />)

      const nameInput = screen.getByLabelText(/name/i)
      await userEvent.type(nameInput, 'John123')

      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/name contains invalid characters/i)).toBeInTheDocument()
      })
    })

    it('should show error when name is too long', async () => {
      render(<NewsletterForm source="/test" />)

      const nameInput = screen.getByLabelText(/name/i)
      const longName = 'a'.repeat(101)
      await userEvent.type(nameInput, longName)

      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/name must be no more than 100 characters/i)).toBeInTheDocument()
      })
    })

    it('should clear errors when user starts typing', async () => {
      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      // Submit with empty email to trigger error
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      })

      // Start typing to clear error
      await userEvent.type(emailInput, 'test@example.com')

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Submission Tests
  // ============================================================================

  describe('Form Submission', () => {
    it('should submit form with valid email only', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Successfully subscribed to newsletter' }),
      })

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            name: undefined,
            source: '/test',
          }),
        })
      })

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Successfully Subscribed!',
          expect.objectContaining({
            description: 'Thank you for subscribing to our newsletter.',
          })
        )
      })

      // Form should be reset
      expect(emailInput).toHaveValue('')
    })

    it('should submit form with email and name', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Successfully subscribed to newsletter' }),
      })

      render(<NewsletterForm source="/services" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const nameInput = screen.getByLabelText(/name/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'john@example.com')
      await userEvent.type(nameInput, 'John Doe')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'john@example.com',
            name: 'John Doe',
            source: '/services',
          }),
        })
      })

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('should show loading state during submission', async () => {
      // Mock a delayed response
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      )

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/subscribing/i)).toBeInTheDocument()
      })

      // Button should be disabled
      expect(submitButton).toBeDisabled()

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.queryByText(/subscribing/i)).not.toBeInTheDocument()
      })
    })

    it('should disable inputs during submission', async () => {
      // Mock a delayed response
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      )

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      // Inputs should be disabled during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled()
        expect(nameInput).toBeDisabled()
      })

      // Wait for submission to complete
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(nameInput).not.toBeDisabled()
      })
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should display API error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Email already subscribed',
          field: 'email',
        }),
      })

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email already subscribed/i)).toBeInTheDocument()
      })

      // Should show error toast
      expect(toast.error).toHaveBeenCalledWith(
        'Subscription Failed',
        expect.objectContaining({
          description: 'Email already subscribed',
        })
      )
    })

    it('should display generic error for API errors without field', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Service temporarily unavailable',
        }),
      })

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/service temporarily unavailable/i)).toBeInTheDocument()
      })

      expect(toast.error).toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      expect(toast.error).toHaveBeenCalledWith(
        'Connection Error',
        expect.objectContaining({
          description: expect.stringContaining('Network error'),
        })
      )
    })

    it('should re-enable form after error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Test error',
        }),
      })

      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument()
      })

      // Form should be re-enabled
      expect(submitButton).not.toBeDisabled()
      expect(emailInput).not.toBeDisabled()
    })
  })

  // ============================================================================
  // Callback Tests
  // ============================================================================

  describe('Callbacks', () => {
    it('should call onSuccess callback on successful submission', async () => {
      const onSuccess = jest.fn()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(<NewsletterForm source="/test" onSuccess={onSuccess} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should call onError callback on submission error', async () => {
      const onError = jest.fn()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Test error',
        }),
      })

      render(<NewsletterForm source="/test" onError={onError} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Test error')
      })
    })

    it('should call onError callback on network error', async () => {
      const onError = jest.fn()

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<NewsletterForm source="/test" onError={onError} />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      await userEvent.type(emailInput, 'test@example.com')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.stringContaining('Network error')
        )
      })
    })
  })

  // ============================================================================
  // Variant Tests
  // ============================================================================

  describe('Variants', () => {
    it('should render inline variant', () => {
      render(<NewsletterForm source="/test" variant="inline" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render modal variant', () => {
      render(<NewsletterForm source="/test" variant="modal" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render footer variant', () => {
      render(<NewsletterForm source="/test" variant="footer" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <NewsletterForm source="/test" className="custom-class" />
      )
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper aria-invalid on email field with error', async () => {
      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should have proper aria-describedby on email field with error', async () => {
      render(<NewsletterForm source="/test" />)

      const emailInput = screen.getByLabelText(/email address/i)
      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-describedby', 'newsletter-email-error')
      })
    })

    it('should have role="alert" on error messages', async () => {
      render(<NewsletterForm source="/test" />)

      const submitButton = screen.getByRole('button', { name: /subscribe to newsletter/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/email is required/i)
        expect(errorMessage).toHaveAttribute('role', 'alert')
      })
    })
  })
})
