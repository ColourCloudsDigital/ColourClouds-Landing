"use client"

/**
 * Google reCAPTCHA v3 Provider Component
 * 
 * Wraps the application with Google reCAPTCHA v3 context.
 * This allows any child component to use the useGoogleReCaptcha hook
 * to execute reCAPTCHA challenges.
 * 
 * Usage:
 * 1. Wrap your app or specific pages with this provider
 * 2. Use the useGoogleReCaptcha hook in child components
 * 
 * @example
 * // In layout.tsx or page.tsx
 * <ReCaptchaProvider>
 *   <YourComponent />
 * </ReCaptchaProvider>
 */

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

interface ReCaptchaProviderProps {
  children: React.ReactNode
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  // If no site key is configured, render children without reCAPTCHA
  // This allows the app to work in development without reCAPTCHA configured
  if (!siteKey) {
    console.warn('reCAPTCHA site key not configured. reCAPTCHA protection is disabled.')
    return <>{children}</>
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}
