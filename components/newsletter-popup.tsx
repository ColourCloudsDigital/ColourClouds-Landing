"use client"

/**
 * Newsletter Popup Modal Component - Cute Design
 * 
 * A centered modal with cute envelope icon that appears 5 seconds after page load.
 * Features:
 * - 5-second delay before display
 * - Backdrop blur for emphasis
 * - localStorage persistence for user preferences
 * - Smooth animations
 * - Mobile responsive
 * - Colour Clouds brand colors (cc-green)
 * - Dark mode support
 * - "Don't show again" checkbox
 * - "Maybe Later" option
 * - Google reCAPTCHA v3 protection
 */

import * as React from "react"
import { X, Mail } from "lucide-react"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

export function NewsletterPopup() {
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isOpen, setIsOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [dontShowAgain, setDontShowAgain] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    // Check if user has dismissed the popup
    const dismissed = localStorage.getItem("newsletter-popup-dismissed")
    if (dismissed === "true") {
      return
    }

    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("newsletter-popup-dismissed", "true")
    }
    setIsOpen(false)
    document.body.style.overflow = "unset"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Check if reCAPTCHA is available
    if (!executeRecaptcha) {
      setError('Security check not ready. Please wait a moment.')
      setIsSubmitting(false)
      return
    }

    try {
      // Execute reCAPTCHA challenge
      const recaptchaToken = await executeRecaptcha('newsletter_submit')

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          source: "/popup",
          recaptchaToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      // Success!
      setIsSuccess(true)
      setEmail("")

      // Close popup after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 max-w-[320px] w-[90vw] text-center shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Cute envelope icon */}
            <svg
              width="60"
              height="50"
              viewBox="0 0 60 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-4"
            >
              {/* Envelope body */}
              <rect x="5" y="10" width="50" height="30" rx="5" fill="#01A750" />
              {/* Flap */}
              <path d="M5 10L30 30L55 10" fill="#01A750" />
              {/* Closed eyes */}
              <path
                d="M18 22Q23 18 28 22"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M32 22Q37 18 42 22"
                stroke="#333"
                strokeWidth="2"
                fill="none"
              />
              {/* Hearts (simple circles for cheeks) */}
              <circle cx="20" cy="30" r="3" fill="#FF69B4" />
              <circle cx="40" cy="30" r="3" fill="#FF69B4" />
            </svg>

            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Join Newsletter
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Stay updated with our latest news, tips, and exclusive offers.
            </p>

            {/* Email input with icon */}
            <form onSubmit={handleSubmit}>
              <div className="relative mb-3">
                <input
                  type="email"
                  placeholder="Example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full py-3 pl-10 pr-3 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cc-green focus:border-transparent disabled:opacity-50"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 mb-3 text-left">{error}</p>
              )}

              {/* Green button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-cc-green hover:bg-cc-green/90 text-white rounded-lg text-base font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                  </>
                ) : (
                  <>
                    Done
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-sm">
              <button
                onClick={handleClose}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                Maybe Later
              </button>
            </p>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="py-8">
              <div className="w-16 h-16 bg-cc-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Successfully Subscribed!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thank you for joining our newsletter. Check your email for confirmation.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
