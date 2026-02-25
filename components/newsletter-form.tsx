"use client"

/**
 * Newsletter Subscription Form Component
 * 
 * A reusable newsletter subscription form with:
 * - Client-side validation
 * - Loading states during submission
 * - Success/error toast notifications using Sonner
 * - Accessible form labels and error messages
 * - Multiple display variants (inline, modal, footer)
 * - Google reCAPTCHA v3 protection against spam
 * 
 * Requirements: 3.1, 3.6, 3.7, 9.2, 9.4
 */

import * as React from "react"
import { toast } from "sonner"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { validateEmail } from "@/lib/validators"

// ============================================================================
// Types
// ============================================================================

export interface NewsletterFormProps {
  /** Current page path for tracking subscription source */
  source: string
  
  /** Display variant of the form */
  variant?: 'inline' | 'modal' | 'footer'
  
  /** Additional CSS classes */
  className?: string
  
  /** Callback function called on successful subscription */
  onSuccess?: () => void
  
  /** Callback function called on error */
  onError?: (error: string) => void
}

interface FormState {
  email: string
  name: string
  isSubmitting: boolean
  errors: {
    email?: string
    name?: string
    general?: string
  }
}

// ============================================================================
// Component
// ============================================================================

/**
 * Newsletter subscription form component
 * 
 * @example
 * // Basic usage
 * <NewsletterForm source="/services" />
 * 
 * @example
 * // Footer variant with custom styling
 * <NewsletterForm 
 *   source="/home" 
 *   variant="footer"
 *   className="max-w-md"
 * />
 * 
 * @example
 * // With callbacks
 * <NewsletterForm 
 *   source="/blog"
 *   onSuccess={() => console.log('Subscribed!')}
 *   onError={(error) => console.error(error)}
 * />
 */
export function NewsletterForm({
  source,
  variant = 'inline',
  className,
  onSuccess,
  onError,
}: NewsletterFormProps) {
  // reCAPTCHA hook
  const { executeRecaptcha } = useGoogleReCaptcha()

  // Check if user has already subscribed
  const [hasSubscribed, setHasSubscribed] = React.useState(false)

  React.useEffect(() => {
    const subscribed = localStorage.getItem("newsletter-subscribed")
    setHasSubscribed(subscribed === "true")
  }, [])

  // Form state management
  const [formState, setFormState] = React.useState<FormState>({
    email: '',
    name: '',
    isSubmitting: false,
    errors: {},
  })

  // ============================================================================
  // Validation
  // ============================================================================

  /**
   * Validates the email field
   * Requirements: 3.3, 3.4, 3.8
   */
  const validateEmailField = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required'
    }
    
    if (!validateEmail(email)) {
      return 'Please enter a valid email address'
    }
    
    return undefined
  }

  /**
   * Validates the name field (optional)
   */
  const validateNameField = (name: string): string | undefined => {
    // Name is optional, but if provided must be valid
    if (name.trim().length > 0) {
      if (name.trim().length > 100) {
        return 'Name must be no more than 100 characters'
      }
      
      if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
        return 'Name contains invalid characters'
      }
    }
    
    return undefined
  }

  /**
   * Validates all form fields
   * Returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const emailError = validateEmailField(formState.email)
    const nameError = validateNameField(formState.name)
    
    setFormState(prev => ({
      ...prev,
      errors: {
        email: emailError,
        name: nameError,
      },
    }))
    
    return !emailError && !nameError
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles email input change with real-time validation
   */
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    
    setFormState(prev => ({
      ...prev,
      email,
      errors: {
        ...prev.errors,
        email: undefined,
        general: undefined,
      },
    }))
  }

  /**
   * Handles name input change with real-time validation
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    
    setFormState(prev => ({
      ...prev,
      name,
      errors: {
        ...prev.errors,
        name: undefined,
        general: undefined,
      },
    }))
  }

  /**
   * Handles form submission
   * Requirements: 3.2, 3.6, 3.7, 9.2, 9.4
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }

    // Check if reCAPTCHA is available
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not yet loaded')
      toast.error('Security Check Failed', {
        description: 'Please wait a moment and try again.',
      })
      return
    }
    
    // Set loading state
    // Requirements: 9.2
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
    }))
    
    try {
      // Execute reCAPTCHA challenge
      const recaptchaToken = await executeRecaptcha('newsletter_submit')

      // Submit to API
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.email.trim(),
          name: formState.name.trim() || undefined,
          source,
          recaptchaToken, // Include reCAPTCHA token
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle API errors
        // Requirements: 3.7, 9.4
        const errorMessage = data.error || 'Failed to subscribe. Please try again.'
        
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: {
            [data.field || 'general']: errorMessage,
          },
        }))
        
        // Show error toast
        toast.error('Subscription Failed', {
          description: errorMessage,
        })
        
        // Call error callback if provided
        if (onError) {
          onError(errorMessage)
        }
        
        return
      }
      
      // Success!
      // Requirements: 3.6
      setFormState({
        email: '',
        name: '',
        isSubmitting: false,
        errors: {},
      })
      
      // Mark user as subscribed in localStorage
      localStorage.setItem("newsletter-subscribed", "true")
      setHasSubscribed(true)
      
      // Show success toast
      toast.success('Successfully Subscribed!', {
        description: 'Thank you for subscribing to our newsletter.',
      })
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
    } catch (error) {
      // Handle network errors
      // Requirements: 3.7, 9.4
      const errorMessage = 'Network error. Please check your connection and try again.'
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: {
          general: errorMessage,
        },
      }))
      
      toast.error('Connection Error', {
        description: errorMessage,
      })
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  // Determine layout classes based on variant
  const containerClasses = cn(
    'w-full',
    {
      'max-w-md': variant === 'inline',
      'max-w-sm': variant === 'modal',
      'max-w-lg': variant === 'footer',
    },
    className
  )

  const formClasses = cn(
    'space-y-4',
    {
      'space-y-3': variant === 'footer',
    }
  )

  const inputGroupClasses = cn(
    'space-y-2',
    {
      'space-y-1.5': variant === 'footer',
    }
  )

  return (
    <div className={containerClasses}>
      {hasSubscribed ? (
        // Already subscribed message
        <div className="rounded-lg bg-cc-green/10 border border-cc-green/20 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-cc-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-semibold text-cc-green">Already Subscribed!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You're already on our newsletter list. Thank you for being a subscriber!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={formClasses} noValidate>
        {/* Email Field */}
        <div className={inputGroupClasses}>
          <Label htmlFor="newsletter-email" className="text-sm font-medium">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="newsletter-email"
            type="email"
            placeholder="your.email@example.com"
            value={formState.email}
            onChange={handleEmailChange}
            disabled={formState.isSubmitting}
            aria-invalid={!!formState.errors.email}
            aria-describedby={
              formState.errors.email ? 'newsletter-email-error' : undefined
            }
            className={cn({
              'border-destructive focus-visible:ring-destructive': formState.errors.email,
            })}
            required
          />
          {formState.errors.email && (
            <p
              id="newsletter-email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {formState.errors.email}
            </p>
          )}
        </div>

        

        {/* General Error Message */}
        {formState.errors.general && (
          <div
            className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {formState.errors.general}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={formState.isSubmitting}
          className="w-full"
          size={variant === 'footer' ? 'default' : 'lg'}
        >
          {formState.isSubmitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Subscribing...
            </>
          ) : (
            'Subscribe to Newsletter'
          )}
        </Button>

        {/* Privacy Notice */}
        <p className="text-xs text-muted-foreground">
          We respect your privacy. Unsubscribe at any time.
        </p>

        {/* reCAPTCHA Notice */}
        <p className="text-xs text-muted-foreground">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Terms of Service
          </a>{' '}
          apply. View our{' '}
          <a
            href="/privacy-policy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Privacy Policy
          </a>.
        </p>
      </form>
      )}
    </div>
  )
}
