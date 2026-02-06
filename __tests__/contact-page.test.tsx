/**
 * Contact Page Component Tests
 * 
 * Tests for the enhanced contact page component including:
 * - Form rendering
 * - Client-side validation
 * - Form submission
 * - Contact information display
 * 
 * Requirements: 5.1, 5.6, 5.7, 5.9, 5.10, 9.2, 9.4
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPage from '@/app/contact/page'
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

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('should render the contact page with all form fields', () => {
      render(<ContactPage />)

      // Check page title
      expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument()

      // Check form fields
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()

      // Check submit button
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })

    it('should display contact information', () => {
      render(<ContactPage />)

      // Check email is displayed
      expect(screen.getByText('colourclouds042@gmail.com')).toBeInTheDocument()

      // Check email link
      const emailLink = screen.getByRole('link', { name: /colourclouds042@gmail.com/i })
      expect(emailLink).toHaveAttribute('href', 'mailto:colourclouds042@gmail.com')
    })

    it('should display social media links', () => {
      render(<ContactPage />)

      // Check social media links are present
      expect(screen.getByRole('link', { name: /twitter/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Client-side Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<ContactPage />)

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/subject is required/i)).toBeInTheDocument()
        expect(screen.getByText(/message is required/i)).toBeInTheDocument()
      })

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup()
      render(<ContactPage />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for short name', async () => {
      const user = userEvent.setup()
      render(<ContactPage />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'A')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for short subject', async () => {
      const user = userEvent.setup()
      render(<ContactPage />)

      const subjectInput = screen.getByLabelText(/subject/i)
      await user.type(subjectInput, 'Hi')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/subject must be at least 3 characters/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for short message', async () => {
      const user = userEvent.setup()
      render(<ContactPage />)

      const messageInput = screen.getByLabelText(/message/i)
      await user.type(messageInput, 'Short')

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Form Submission Tests
  // ============================================================================

  describe('Form Submission', () => {
    it('should submit form with valid data and show success toast', async () => {
      const user = userEvent.setup()
      
      // Mock successful API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Contact form submitted successfully' }),
      })

      render(<ContactPage />)

      // Fill in form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I would like to discuss a project with you.')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      // Should call API with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/contact',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('john@example.com'),
          })
        )
      })

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Message Sent Successfully!',
          expect.objectContaining({
            description: expect.stringContaining('Thank you'),
          })
        )
      })

      // Form should be reset
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('')
        expect(screen.getByLabelText(/email/i)).toHaveValue('')
        expect(screen.getByLabelText(/subject/i)).toHaveValue('')
        expect(screen.getByLabelText(/message/i)).toHaveValue('')
      })
    })

    it('should show error toast when API returns error', async () => {
      const user = userEvent.setup()
      
      // Mock API error response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ 
          success: false, 
          error: 'Failed to submit. Please try again.',
          field: 'general',
        }),
      })

      render(<ContactPage />)

      // Fill in form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I would like to discuss a project with you.')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      // Should show error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Submission Failed',
          expect.objectContaining({
            description: expect.stringContaining('Failed to submit'),
          })
        )
      })
    })

    it('should show error toast on network error', async () => {
      const user = userEvent.setup()
      
      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<ContactPage />)

      // Fill in form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I would like to discuss a project with you.')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      // Should show error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Connection Error',
          expect.objectContaining({
            description: expect.stringContaining('Network error'),
          })
        )
      })
    })

    it('should disable submit button during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow API response
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100))
      )

      render(<ContactPage />)

      // Fill in form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I would like to discuss a project with you.')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      // Button should be disabled during submission
      await waitFor(() => {
        const sendingButton = screen.getByRole('button', { name: /sending/i })
        expect(sendingButton).toBeDisabled()
      })
    })
  })

  // ============================================================================
  // Spam Protection Tests
  // ============================================================================

  describe('Spam Protection', () => {
    it('should include honeypot field in submission', async () => {
      const user = userEvent.setup()
      
      // Mock successful API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(<ContactPage />)

      // Fill in form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry')
      await user.type(screen.getByLabelText(/message/i), 'I would like to discuss a project with you.')

      // Submit form
      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Should include honeypot field in request
      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls[0]
        const body = JSON.parse(callArgs[1].body)
        expect(body).toHaveProperty('honeypot')
        expect(body).toHaveProperty('timestamp')
      })
    })
  })

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form fields', () => {
      render(<ContactPage />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)

      expect(nameInput).toHaveAttribute('aria-invalid', 'false')
      expect(emailInput).toHaveAttribute('aria-invalid', 'false')
      expect(subjectInput).toHaveAttribute('aria-invalid', 'false')
      expect(messageInput).toHaveAttribute('aria-invalid', 'false')
    })

    it('should mark invalid fields with aria-invalid', async () => {
      const user = userEvent.setup()
      render(<ContactPage />)

      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should have proper link attributes for external links', () => {
      render(<ContactPage />)

      const twitterLink = screen.getByRole('link', { name: /twitter/i })
      expect(twitterLink).toHaveAttribute('target', '_blank')
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
