/**
 * Google reCAPTCHA v3 Server-Side Verification
 * 
 * Provides utilities for verifying reCAPTCHA tokens on the server.
 * 
 * Requirements:
 * - RECAPTCHA_SECRET_KEY environment variable must be set
 * - Token must be generated from the client using reCAPTCHA v3
 */

/**
 * reCAPTCHA verification response from Google
 */
interface ReCaptchaVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  score?: number
  action?: string
  'error-codes'?: string[]
}

/**
 * Verifies a reCAPTCHA token with Google's API
 * 
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - Optional action name to verify (e.g., 'newsletter_submit')
 * @param minScore - Minimum score threshold (0.0 to 1.0). Default is 0.5
 * @returns Promise<boolean> - True if verification passes, false otherwise
 * 
 * @example
 * const isValid = await verifyRecaptcha(token, 'newsletter_submit', 0.5)
 * if (!isValid) {
 *   return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
 * }
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  minScore: number = 0.5
): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  // If no secret key is configured, skip verification
  // This allows the app to work in development without reCAPTCHA configured
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured. Skipping verification.')
    return true
  }

  // Validate token format
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    console.error('Invalid reCAPTCHA token format')
    return false
  }

  try {
    // Call Google's reCAPTCHA verification API
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    if (!response.ok) {
      console.error('reCAPTCHA verification API request failed:', response.status)
      return false
    }

    const data: ReCaptchaVerifyResponse = await response.json()

    // Check if verification was successful
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes'])
      return false
    }

    // Check score (reCAPTCHA v3 returns a score from 0.0 to 1.0)
    // Higher scores indicate more likely human interaction
    if (data.score !== undefined && data.score < minScore) {
      console.warn(`reCAPTCHA score too low: ${data.score} (minimum: ${minScore})`)
      return false
    }

    // Optionally verify the action matches what we expect
    if (expectedAction && data.action !== expectedAction) {
      console.warn(`reCAPTCHA action mismatch: expected "${expectedAction}", got "${data.action}"`)
      return false
    }

    // All checks passed
    return true

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return false
  }
}

/**
 * Validates reCAPTCHA configuration
 * 
 * @returns boolean - True if reCAPTCHA is properly configured
 */
export function isRecaptchaConfigured(): boolean {
  return !!(
    process.env.RECAPTCHA_SECRET_KEY &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  )
}
