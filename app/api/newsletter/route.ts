/**
 * Newsletter Subscription API Route
 * 
 * POST /api/newsletter
 * 
 * Handles newsletter subscription requests with:
 * - Input validation and sanitization
 * - Rate limiting (5 requests per minute per IP)
 * - Google Sheets integration for storing subscriptions
 * - Appropriate success/error responses
 * 
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.8
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsService } from '@/lib/google-sheets';
import { validateNewsletterForm } from '@/lib/validators';
import { sanitizeEmail, sanitizeInput } from '@/lib/sanitize';
import { formRateLimiter } from '@/lib/rate-limit';
import { ValidationError, GoogleSheetsError, RateLimitError, Subscriber } from '@/lib/types';
import { sendNewsletterNotification, sendNewsletterWelcome } from '@/lib/nodemailer';
import { getWATTimestamp } from '@/lib/timezone';

/**
 * POST handler for newsletter subscription
 * 
 * Request body:
 * {
 *   email: string (required) - Subscriber's email address
 *   name?: string (optional) - Subscriber's name
 *   source: string (required) - Page path where subscription occurred
 * }
 * 
 * Response:
 * Success (200): { success: true, message: "Successfully subscribed to newsletter" }
 * Validation Error (400): { success: false, error: "Error message", field: "field_name" }
 * Rate Limit (429): { success: false, error: "Too many requests. Please try again later." }
 * Server Error (500/503): { success: false, error: "Error message" }
 */
export async function POST(request: NextRequest) {
  try {
    // Extract IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               'anonymous';

    // Apply rate limiting: 5 requests per minute per IP
    // Requirements: 11.6
    try {
      await formRateLimiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60', // Retry after 60 seconds
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

    // Validate input
    // Requirements: 3.3, 3.4, 3.8
    let validatedData;
    try {
      validatedData = validateNewsletterForm({
        email: body.email,
        name: body.name,
        source: body.source,
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
    const sanitizedEmail = sanitizeEmail(validatedData.email);
    const sanitizedName = validatedData.name ? sanitizeInput(validatedData.name) : undefined;
    const sanitizedSource = sanitizeInput(validatedData.source);

    // Create subscriber object
    // Requirements: 3.5
    const subscriber: Subscriber = {
      email: sanitizedEmail,
      name: sanitizedName,
      subscribedAt: getWATTimestamp(),
      source: sanitizedSource,
      status: 'active',
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

    // Store subscription in Google Sheets
    // Requirements: 3.2
    try {
      await sheetsService.addSubscriber(subscriber);
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
        console.error('Failed to add subscriber to Google Sheets:', error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to process subscription. Please try again later.' 
          },
          { status: 503 }
        );
      }

      throw error;
    }

    // Send email notifications (non-blocking - don't fail if emails fail)
    // Send notification to admin
    sendNewsletterNotification({
      email: sanitizedEmail,
      name: sanitizedName,
      source: sanitizedSource,
    }).catch(error => {
      console.error('Failed to send admin notification email:', error);
    });

    // Send welcome email to subscriber
    sendNewsletterWelcome({
      email: sanitizedEmail,
      name: sanitizedName,
    }).catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to newsletter' 
      },
      { status: 200 }
    );

  } catch (error: any) {
    // Log unexpected errors
    console.error('Unexpected error in newsletter API:', error);

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
