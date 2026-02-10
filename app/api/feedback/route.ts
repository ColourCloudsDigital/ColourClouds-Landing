/**
 * Feedback API Route
 * 
 * POST /api/feedback
 * 
 * Handles feedback submissions with:
 * - Input validation
 * - MongoDB integration for storing feedback
 * - Appropriate success/error responses
 * - Error logging for debugging
 * 
 * Requirements: 2.5, 9.3, 9.4
 */

import { NextRequest, NextResponse } from 'next/server';
import Feedback from "@/lib/models/feedback";
import { connectToDB } from "@/lib/db/database";

/**
 * Logger utility for API operations
 * Requirements: 2.5 - Log errors for debugging
 */
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[Feedback API INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(`[Feedback API ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  },
};

/**
 * POST handler for feedback submission
 * 
 * Request body:
 * {
 *   name: string (required) - Submitter's name
 *   email: string (required) - Submitter's email address
 *   category: string (required) - Feedback category
 *   message: string (required) - Feedback message
 * }
 * 
 * Response:
 * Success (201): { success: true, data: { id, name, email, category, message } }
 * Validation Error (400): { success: false, error: "Error message" }
 * Server Error (500/503): { success: false, error: "Error message" }
 * 
 * Requirements: 2.5, 9.3, 9.4
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('Received feedback submission request');

    // Parse request body
    // Requirements: 9.3 - Handle errors appropriately
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.error('Failed to parse request body', error as Error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body. Please provide valid JSON.' 
        },
        { status: 400 }
      );
    }

    const { name, email, category, message } = body;

    // Validate required fields
    // Requirements: 9.3 - Return appropriate error responses
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name is required and must be a non-empty string.' 
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required and must be a non-empty string.' 
        },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please provide a valid email address.' 
        },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Category is required and must be a non-empty string.' 
        },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Message is required and must be a non-empty string.' 
        },
        { status: 400 }
      );
    }

    logger.info('Feedback validation passed', { 
      name: name.substring(0, 20), 
      email: email.substring(0, 20),
      category 
    });

    // Connect to database
    // Requirements: 2.5 - Handle API errors gracefully
    try {
      await connectToDB();
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error as Error);
      // Requirements: 9.4 - Return user-friendly error messages
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service temporarily unavailable. Please try again later.' 
        },
        { status: 503 }
      );
    }

    // Create and save feedback
    // Requirements: 2.5 - Log errors for debugging
    let savedFeedback;
    try {
      const feedback = new Feedback({ 
        name: name.trim(), 
        email: email.trim(), 
        category: category.trim(), 
        message: message.trim() 
      });
      savedFeedback = await feedback.save();
      logger.info('Feedback saved successfully', { id: savedFeedback._id });
    } catch (error) {
      logger.error('Failed to save feedback to MongoDB', error as Error);
      // Requirements: 9.4 - Return user-friendly error messages
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process feedback. Please try again later.' 
        },
        { status: 500 }
      );
    }

    // Return success response
    // Requirements: 9.3 - Return appropriate success responses
    return NextResponse.json(
      { 
        success: true,
        data: {
          id: savedFeedback._id,
          name: savedFeedback.name,
          email: savedFeedback.email,
          category: savedFeedback.category,
          message: savedFeedback.message,
        },
        message: 'Feedback submitted successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    // Log unexpected errors for debugging
    // Requirements: 2.5 - Log errors for debugging
    logger.error('Unexpected error in feedback API', error, {
      errorName: error?.name,
      errorMessage: error?.message,
    });

    // Return generic error response
    // Requirements: 9.4 - Return user-friendly error messages
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
