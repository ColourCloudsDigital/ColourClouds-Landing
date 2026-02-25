/**
 * Newsletter Unsubscribe API Route
 * 
 * POST /api/unsubscribe
 * 
 * Handles newsletter unsubscribe requests with:
 * - Email validation
 * - Google Sheets integration to mark as unsubscribed
 * - Rate limiting
 * - Confirmation email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsService } from '@/lib/google-sheets';
import { sanitizeEmail } from '@/lib/sanitize';
import { formRateLimiter } from '@/lib/rate-limit';
import { sendUnsubscribeConfirmation } from '@/lib/nodemailer';
import { getWATTimestamp } from '@/lib/timezone';

export async function POST(request: NextRequest) {
  try {
    // Extract IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
               request.headers.get('x-real-ip') || 
               'anonymous';

    // Apply rate limiting: 5 requests per minute per IP
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
            'Retry-After': '60',
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
          error: 'Invalid request body.' 
        },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required.' 
        },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format.' 
        },
        { status: 400 }
      );
    }

    // Initialize Google Sheets service
    const sheetsService = getGoogleSheetsService();
    
    try {
      await sheetsService.initialize();
    } catch (error) {
      console.error('Failed to initialize Google Sheets service:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service temporarily unavailable. Please try again later.' 
        },
        { status: 503 }
      );
    }

    // Unsubscribe from newsletter
    try {
      const result = await sheetsService.unsubscribeEmail(sanitizedEmail);
      
      if (!result.found) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Email address not found in our newsletter list.' 
          },
          { status: 404 }
        );
      }

      // Send confirmation email (non-blocking)
      sendUnsubscribeConfirmation({
        email: sanitizedEmail,
      }).catch(error => {
        console.error('Failed to send unsubscribe confirmation email:', error);
      });

      return NextResponse.json(
        { 
          success: true, 
          message: 'Successfully unsubscribed from newsletter.' 
        },
        { status: 200 }
      );

    } catch (error: any) {
      console.error('Failed to unsubscribe email:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process unsubscribe request. Please try again later.' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unexpected error in unsubscribe API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again later.' 
      },
      { status: 500 }
    );
  }
}

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
