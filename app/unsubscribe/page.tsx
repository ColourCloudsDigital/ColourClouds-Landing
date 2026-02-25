"use client"

/**
 * Newsletter Unsubscribe Page
 * 
 * Allows users to unsubscribe from the newsletter with:
 * - Email input or pre-filled from URL parameter
 * - Confirmation step before unsubscribing
 * - Success/error states
 * - Clears localStorage flag to allow re-subscription
 * 
 * Flow: Enter email → Confirm → Unsubscribe → Success
 */

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''

  const [email, setEmail] = React.useState(emailFromUrl)
  const [step, setStep] = React.useState<'input' | 'confirm' | 'processing' | 'success' | 'error'>('input')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  
  // Track if unsubscribe has been attempted to prevent duplicate requests
  const unsubscribeAttempted = React.useRef(false)

  // Prevent newsletter popup from showing on unsubscribe page
  React.useEffect(() => {
    // Set a temporary flag to prevent popup
    sessionStorage.setItem('unsubscribe-in-progress', 'true')
    
    return () => {
      // Clean up when leaving the page
      sessionStorage.removeItem('unsubscribe-in-progress')
    }
  }, [])

  // If email is in URL, automatically start unsubscribe process
  React.useEffect(() => {
    if (emailFromUrl && step === 'input' && !unsubscribeAttempted.current) {
      // Mark as attempted before starting
      unsubscribeAttempted.current = true
      // Auto-unsubscribe without confirmation
      handleAutoUnsubscribe()
    }
  }, [emailFromUrl])

  const handleAutoUnsubscribe = async () => {
    // Double-check to prevent duplicate calls
    if (isSubmitting) {
      return
    }

    setStep('processing')
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailFromUrl.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe')
      }

      // Clear localStorage flag so user can re-subscribe later
      localStorage.removeItem('newsletter-subscribed')
      localStorage.removeItem('newsletter-popup-dismissed')

      setStep('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
      setStep('error')
      // Reset the ref on error so user can retry
      unsubscribeAttempted.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setStep('confirm')
    }
  }

  const handleUnsubscribe = async () => {
    // Prevent duplicate submissions
    if (isSubmitting || unsubscribeAttempted.current) {
      return
    }

    unsubscribeAttempted.current = true
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unsubscribe')
      }

      // Clear localStorage flag so user can re-subscribe later
      localStorage.removeItem('newsletter-subscribed')
      localStorage.removeItem('newsletter-popup-dismissed')

      setStep('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
      setStep('error')
      // Reset the ref on error so user can retry
      unsubscribeAttempted.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep('input')
    setErrorMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Input Step */}
          {step === 'input' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Unsubscribe from Newsletter</h1>
                <p className="text-muted-foreground">
                  We're sorry to see you go. Enter your email address to unsubscribe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>
            </>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Confirm Unsubscribe</h1>
                <p className="text-muted-foreground mb-4">
                  Are you sure you want to unsubscribe from our newsletter?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium">{email}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll no longer receive updates, tips, and exclusive content from Colour Clouds Digital.
                </p>
              </div>

              <div className="space-x-10">
                <Button
                  onClick={handleUnsubscribe}
                  disabled={isSubmitting}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5"
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
                      Unsubscribing...
                    </>
                  ) : (
                    'Yes, Unsubscribe Me'
                  )}
                </Button>
                <Button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400"
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
                </div>
                <h1 className="text-2xl font-bold mb-2">Processing Unsubscribe</h1>
                <p className="text-muted-foreground">
                  Please wait while we remove you from our newsletter list...
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium">{emailFromUrl}</p>
                </div>
              </div>
            </>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Successfully Unsubscribed</h1>
                <p className="text-muted-foreground mb-6">
                  You have been removed from our newsletter list. You will no longer receive emails from us.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    Changed your mind? You can always resubscribe by visiting our website and signing up again.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link href="/" className="block">
                    <Button className="w-full" size="lg">
                      Return to Home
                    </Button>
                  </Link>
                  <Link href="/blog" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Visit Our Blog
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Unsubscribe Failed</h1>
                <p className="text-muted-foreground mb-4">
                  {errorMessage || 'We encountered an error while processing your request.'}
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                  <p className="text-sm">
                    If you continue to experience issues, please contact us at{' '}
                    <a 
                      href="mailto:colourclouds042@gmail.com" 
                      className="text-cc-blue hover:underline"
                    >
                      colourclouds042@gmail.com
                    </a>
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handleBack}
                    className="w-full"
                    size="lg"
                  >
                    Try Again
                  </Button>
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full" size="lg">
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact us at{' '}
          <a 
            href="mailto:colourclouds042@gmail.com" 
            className="text-cc-blue hover:underline"
          >
            colourclouds042@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}
