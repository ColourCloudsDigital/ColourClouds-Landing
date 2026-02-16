"use client"

/**
 * Newsletter Popup Modal Component
 * 
 * A centered modal that appears 5 seconds after page load to encourage
 * newsletter subscriptions. Features:
 * - 5-second delay before display
 * - Backdrop blur for emphasis
 * - localStorage persistence for user preferences
 * - Smooth animations
 * - Mobile responsive
 * - Colour Clouds brand colors
 * 
 * Display Conditions:
 * - Shows after 5 seconds
 * - Respects "don't show again" preference
 * - Doesn't show if user already subscribed
 * - Doesn't show if dismissed in current session
 */

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function NewsletterPopup() {
  // State management
  const [isVisible, setIsVisible] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [dontShowAgain, setDontShowAgain] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState("")

  // Check localStorage and set timer on mount
  React.useEffect(() => {
    // Check if popup should be shown
    const dismissed = localStorage.getItem('newsletter-popup-dismissed')
    const dontShow = localStorage.getItem('newsletter-popup-dont-show')
    const subscribed = localStorage.getItem('newsletter-popup-subscribed')
    
    // Don't show if any condition is met
    if (dismissed || dontShow || subscribed) {
      return
    }
    
    // Set 5-second delay timer
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 5000)
    
    // Cleanup timer on unmount
    return () => clearTimeout(timer)
  }, [])

  // Handle ESC key press
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  // Close modal (can show again on next visit)
  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('newsletter-popup-dismissed', 'true')
  }

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source: '/popup',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to subscribe. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Success!
      setShowSuccess(true)
      localStorage.setItem('newsletter-popup-subscribed', 'true')
      
      // Save "don't show again" preference if checked
      if (dontShowAgain) {
        localStorage.setItem('newsletter-popup-dont-show', 'true')
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)

    } catch (error) {
      setError('Network error. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  // Don't render if not visible
  if (!isVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-popup-title"
    >
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close newsletter popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success State */}
        {showSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#01A750] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Successfully Subscribed!
            </h3>
            <p className="text-gray-600">
              Thank you for subscribing to our newsletter.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2
                id="newsletter-popup-title"
                className="text-2xl font-bold text-gray-900 mb-3"
              >
                Stay Updated with Our Latest Insights
              </h2>
              <p className="text-gray-600">
                Get exclusive tips, tutorials, and updates delivered straight to your inbox.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="popup-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="popup-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border text-black transition-colors",
                    error
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-[#0072FF] focus:border-[#0072FF]",
                    "focus:outline-none focus:ring-2"
                  )}
                  required
                />
              </div>

              {/* Name Input (Optional) */}
              <div>
                <label htmlFor="popup-name" className="sr-only">
                  Name (Optional)
                </label>
                <input
                  id="popup-name"
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:border-[#0072FF] transition-colors"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600" role="alert">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0072FF] hover:bg-[#0072FF]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
                  </span>
                ) : (
                  'Subscribe Now'
                )}
              </button>

              {/* Don't Show Again Checkbox */}
              <div className="flex items-center">
                <input
                  id="dont-show-again"
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-[#0072FF] border-gray-300 rounded focus:ring-[#0072FF]"
                />
                <label
                  htmlFor="dont-show-again"
                  className="ml-2 text-sm text-gray-600"
                >
                  Don't show this again
                </label>
              </div>

              {/* Privacy Notice */}
              <p className="text-xs text-gray-500 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
