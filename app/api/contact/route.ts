/**
 * Contact Form API Route
 * 
 * POST /api/contact
 * 
 * Handles contact form submissions with:
 * - Input validation and sanitization
 * - Rate limiting (3 submissions per hour per IP)
 * - Spam protection (honeypot field, time-based validation)
 * - Google Sheets integration for storing submissions
 * - Appropriate success/error responses
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.8
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsService } from '@/lib/google-sheets';
import { validateContactForm } from '@/lib/validators';
import { sanitizeEmail, sanitizeInput } from '@/lib/sanitize';
import { rateLimit } from '@/lib/rate-limit';
import { ValidationError, GoogleSheetsError, RateLimitError, ContactSubmission } from '@/lib/types';
import { randomUUID } from 'crypto';
import { sendContactFormNotification, sendContactConfirmation } from '@/lib/nodemailer';
import { getWATTimestamp } from '@/lib/timezone';
import { verifyRecaptcha } from '@/lib/recaptcha';

/**
 * Rate limiter for contact form submissions
 * 3 submissions per hour per IP address
 * Requirements: 5.8, 11.6
 */
const contactRateLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

/**
 * Minimum time (in milliseconds) that must elapse between form load and submission
 * This helps prevent automated bot submissions
 * Requirements: 5.8
 */
const MIN_SUBMISSION_TIME = 3000; // 3 seconds

/**
 * POST handler for contact form submission
 * 
 * Request body:
 * {
 *   name: string (required) - Submitter's name
 *   email: string (required) - Submitter's email address
 *   subject: string (required) - Message subject
 *   message: string (required) - Message content
 *   honeypot?: string (optional) - Honeypot field for spam detection (should be empty)
 *   timestamp?: number (optional) - Form load timestamp for time-based validation
 *   recaptchaToken: string (required) - reCAPTCHA v3 token for spam protection
 * }
 * 
 * Response:
 * Success (200): { success: true, message: "Contact form submitted successfully" }
 * Validation Error (400): { success: false, error: "Error message", field: "field_name" }
 * Rate Limit (429): { success: false, error: "Too many submissions. Please try again later." }
 * Server Error (500/503): { success: false, error: "Error message" }
 */
export async function POST(request: NextRequest) {
  try {
    // Extract IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               'anonymous';

    // Apply rate limiting: 3 submissions per hour per IP
    // Requirements: 5.8, 11.6
    try {
      await contactRateLimiter.check(3, ip);
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many submissions. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '3600', // Retry after 1 hour
          }
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body. Please provide valid JSON.' 
        },
        { status: 400 }
      );
    }

    // Spam Protection: Honeypot field check
    // Requirements: 5.8
    // The honeypot field should be hidden from users and left empty
    // If it's filled, it's likely a bot
    if (body.honeypot && body.honeypot.trim() !== '') {
      // Log the spam attempt but return success to avoid revealing the honeypot
      console.warn('[SPAM] Honeypot field filled', { ip, honeypot: body.honeypot });
      
      // Return success to the bot to avoid revealing the spam detection
      return NextResponse.json(
        { 
          success: true, 
          message: 'Contact form submitted successfully' 
        },
        { status: 200 }
      );
    }

    // Spam Protection: Time-based validation
    // Requirements: 5.8
    // Check if the form was submitted too quickly (likely a bot)
    if (body.timestamp && typeof body.timestamp === 'number') {
      const submissionTime = Date.now();
      const timeDiff = submissionTime - body.timestamp;
      
      if (timeDiff < MIN_SUBMISSION_TIME) {
        // Log the spam attempt but return success to avoid revealing the check
        console.warn('[SPAM] Form submitted too quickly', { 
          ip, 
          timeDiff, 
          minRequired: MIN_SUBMISSION_TIME 
        });
        
        // Return success to the bot to avoid revealing the spam detection
        return NextResponse.json(
          { 
            success: true, 
            message: 'Contact form submitted successfully' 
          },
          { status: 200 }
        );
      }
    }

    // Verify reCAPTCHA token
    // Requirements: 11.2 - Spam protection
    const recaptchaToken = body.recaptchaToken;
    
    if (!recaptchaToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA verification required.' 
        },
        { status: 400 }
      );
    }

    const isRecaptchaValid = await verifyRecaptcha(
      recaptchaToken,
      'contact_submit',
      0.5 // Minimum score threshold
    );

    if (!isRecaptchaValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'reCAPTCHA verification failed. Please try again.' 
        },
        { status: 400 }
      );
    }

    // Validate input
    // Requirements: 5.3, 5.4
    let validatedData;
    try {
      validatedData = validateContactForm({
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message,
            field: error.field,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Sanitize input to prevent XSS and ensure data safety
    // Requirements: 11.2
    const sanitizedName = sanitizeInput(validatedData.name);
    const sanitizedEmail = sanitizeEmail(validatedData.email);
    const sanitizedSubject = sanitizeInput(validatedData.subject);
    const sanitizedMessage = sanitizeInput(validatedData.message);

    // Create contact submission object
    // Requirements: 5.5
    const submission: ContactSubmission = {
      id: randomUUID(),
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      submittedAt: getWATTimestamp(),
      status: 'new',
      ipAddress: ip !== 'anonymous' ? ip : undefined,
    };

    // Initialize Google Sheets service
    const sheetsService = getGoogleSheetsService();
    
    try {
      await sheetsService.initialize();
    } catch (error) {
      if (error instanceof GoogleSheetsError) {
        console.error('Failed to initialize Google Sheets service:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Service temporarily unavailable. Please try again later.' 
          },
          { status: 503 }
        );
      }
      throw error;
    }

    // Store submission in Google Sheets
    // Requirements: 5.2
    try {
      await sheetsService.addContactSubmission(submission);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Service is currently busy. Please try again in a moment.' 
          },
          { 
            status: 429,
            headers: {
              'Retry-After': error.retryAfter.toString(),
            }
          }
        );
      }

      if (error instanceof GoogleSheetsError) {
        console.error('Failed to add contact submission to Google Sheets:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to process submission. Please try again later.' 
          },
          { status: 503 }
        );
      }

      throw error;
    }

    // Send email notifications (non-blocking - don't fail if emails fail)
    // Send notification to admin
    sendContactFormNotification({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    }).catch(error => {
      console.error('Failed to send admin notification email:', error);
    });

    // Send confirmation to user
    sendContactConfirmation({
      name: sanitizedName,
      email: sanitizedEmail,
    }).catch(error => {
      console.error('Failed to send confirmation email:', error);
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully' 
      },
      { status: 200 }
    );

  } catch (error: any) {
    // Log unexpected errors
    console.error('Unexpected error in contact API:', error);

    // Return generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}
