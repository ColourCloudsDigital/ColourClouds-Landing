/**
 * Google Sheets Service Wrapper
 * 
 * Provides a centralized interface for all Google Sheets operations with:
 * - JWT authentication using service account
 * - Error handling with exponential backoff for rate limits
 * - Logging for all operations
 * - Type-safe methods for reading and writing data
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GoogleSheetsError, RateLimitError, BlogPost, Subscriber, ContactSubmission } from './types';

/**
 * Logger utility for Google Sheets operations
 */
const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[GoogleSheets INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(`[GoogleSheets ERROR] ${new Date().toISOString()} - ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...meta
    });
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[GoogleSheets WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }
};

/**
 * Configuration for exponential backoff retry logic
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 32000,
  backoffMultiplier: 2
};

/**
 * Google Sheets Service Class
 * 
 * Handles all interactions with Google Sheets API v4
 */
export class GoogleSheetsService {
  private auth: JWT | null = null;
  private sheets: any = null;
  private spreadsheetId: string;
  private initialized: boolean = false;

  constructor(spreadsheetId?: string) {
    this.spreadsheetId = spreadsheetId || process.env.GOOGLE_SHEET_ID || '';
    
    if (!this.spreadsheetId) {
      logger.warn('Google Sheets ID not provided. Service will not function until initialized with a valid ID.');
    }
  }

  /**
   * Initialize the Google Sheets service with JWT authentication
   * Requirements: 2.1, 2.2
   * 
   * @throws {GoogleSheetsError} If credentials are missing or invalid
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Google Sheets service...');

      // Validate environment variables
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!serviceAccountEmail || !privateKey) {
        throw new GoogleSheetsError(
          'Missing Google Sheets credentials. Ensure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set.',
          'MISSING_CREDENTIALS',
          500
        );
      }

      if (!this.spreadsheetId) {
        throw new GoogleSheetsError(
          'Missing Google Sheets ID. Ensure GOOGLE_SHEET_ID is set.',
          'MISSING_SHEET_ID',
          500
        );
      }

      // Create JWT auth client
      this.auth = new JWT({
        email: serviceAccountEmail,
        key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      // Initialize Google Sheets API client
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      // Test the connection by fetching spreadsheet metadata
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      this.initialized = true;
      logger.info('Google Sheets service initialized successfully', {
        spreadsheetId: this.spreadsheetId
      });
    } catch (error: any) {
      logger.error('Failed to initialize Google Sheets service', error);
      
      if (error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to initialize Google Sheets service: ${error.message}`,
        'INITIALIZATION_ERROR',
        500
      );
    }
  }

  /**
   * Ensure the service is initialized before operations
   * @private
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new GoogleSheetsError(
        'Google Sheets service not initialized. Call initialize() first.',
        'NOT_INITIALIZED',
        500
      );
    }
  }

  /**
   * Execute an operation with exponential backoff retry logic
   * Requirements: 2.4
   * 
   * @private
   * @param operation - The async operation to execute
   * @param operationName - Name of the operation for logging
   * @param config - Retry configuration
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = config.initialDelayMs;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error (429)
        const isRateLimitError = error.code === 429 || 
                                 error.message?.includes('rate limit') ||
                                 error.message?.includes('quota exceeded');

        if (isRateLimitError && attempt < config.maxRetries) {
          const retryAfter = error.response?.headers?.['retry-after'] 
            ? parseInt(error.response.headers['retry-after']) * 1000 
            : delay;

          logger.warn(`Rate limit hit for ${operationName}. Retrying in ${retryAfter}ms (attempt ${attempt + 1}/${config.maxRetries})`, {
            attempt: attempt + 1,
            maxRetries: config.maxRetries,
            delay: retryAfter
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryAfter));

          // Exponential backoff
          delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
          continue;
        }

        // If it's not a rate limit error or we've exhausted retries, throw
        if (isRateLimitError) {
          throw new RateLimitError(
            'Google Sheets API rate limit exceeded. Please try again later.',
            Math.ceil(delay / 1000)
          );
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    // If we get here, we've exhausted all retries
    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Read data from a Google Sheet
   * Requirements: 2.3
   * 
   * @param sheetName - Name of the sheet to read from
   * @param range - A1 notation range (e.g., "A1:Z100")
   * @returns 2D array of cell values
   * @throws {GoogleSheetsError} If the read operation fails
   */
  async readSheet(sheetName: string, range: string): Promise<any[][]> {
    this.ensureInitialized();

    try {
      logger.info(`Reading from sheet: ${sheetName}, range: ${range}`);

      const result = await this.executeWithRetry(
        async () => {
          const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}!${range}`,
          });
          return response.data.values || [];
        },
        `readSheet(${sheetName}, ${range})`
      );

      logger.info(`Successfully read ${result.length} rows from ${sheetName}`);
      return result;
    } catch (error: any) {
      logger.error(`Failed to read from sheet ${sheetName}`, error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to read from sheet ${sheetName}: ${error.message}`,
        'READ_ERROR',
        500
      );
    }
  }

  /**
   * Append a row to a Google Sheet
   * Requirements: 2.3
   * 
   * @param sheetName - Name of the sheet to append to
   * @param values - Array of values to append as a new row
   * @throws {GoogleSheetsError} If the append operation fails
   */
  async appendRow(sheetName: string, values: any[]): Promise<void> {
    this.ensureInitialized();

    try {
      logger.info(`Appending row to sheet: ${sheetName}`, { valueCount: values.length });

      await this.executeWithRetry(
        async () => {
          await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: `${sheetName}!A:A`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
              values: [values],
            },
          });
        },
        `appendRow(${sheetName})`
      );

      logger.info(`Successfully appended row to ${sheetName}`);
    } catch (error: any) {
      logger.error(`Failed to append row to sheet ${sheetName}`, error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to append row to sheet ${sheetName}: ${error.message}`,
        'APPEND_ERROR',
        500
      );
    }
  }

  /**
   * Get all published blog posts from Google Sheets
   * Requirements: 4.1, 4.2
   * 
   * @returns Array of blog posts
   */
  async getBlogPosts(): Promise<BlogPost[]> {
    this.ensureInitialized();

    try {
      logger.info('Fetching blog posts from Google Sheets');

      const rows = await this.readSheet('Blog', 'A2:L1000'); // Skip header row

      const posts: BlogPost[] = rows
        .filter(row => row.length >= 11) // Ensure row has minimum required columns
        .map((row, index) => ({
          id: row[0] || `post-${index}`,
          slug: row[1] || '',
          title: row[2] || '',
          author: row[3] || '',
          publishedAt: row[4] || new Date().toISOString(),
          content: row[5] || '',
          excerpt: row[6] || '',
          featuredImage: row[7] || '',
          category: row[8] || '',
          tags: row[9] ? row[9].split(',').map((tag: string) => tag.trim()) : [],
          status: (row[10] || 'draft') as 'draft' | 'published' | 'archived',
          readTime: row[11] ? parseInt(row[11]) : undefined,
        }))
        .filter(post => post.status === 'published'); // Only return published posts

      logger.info(`Successfully fetched ${posts.length} published blog posts`);
      return posts;
    } catch (error: any) {
      logger.error('Failed to fetch blog posts', error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to fetch blog posts: ${error.message}`,
        'FETCH_BLOG_POSTS_ERROR',
        500
      );
    }
  }

  /**
   * Get a single blog post by slug
   * Requirements: 4.3, 4.4
   * 
   * @param slug - URL-friendly identifier for the blog post
   * @returns Blog post or null if not found
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    this.ensureInitialized();

    try {
      logger.info(`Fetching blog post with slug: ${slug}`);

      const posts = await this.getBlogPosts();
      const post = posts.find(p => p.slug === slug) || null;

      if (post) {
        logger.info(`Found blog post: ${post.title}`);
      } else {
        logger.warn(`Blog post not found with slug: ${slug}`);
      }

      return post;
    } catch (error: any) {
      logger.error(`Failed to fetch blog post with slug ${slug}`, error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to fetch blog post: ${error.message}`,
        'FETCH_BLOG_POST_ERROR',
        500
      );
    }
  }

  /**
   * Add a newsletter subscriber to Google Sheets
   * Requirements: 3.2, 3.5
   * 
   * @param subscriber - Subscriber data to add
   */
  async addSubscriber(subscriber: Subscriber): Promise<void> {
    this.ensureInitialized();

    try {
      logger.info(`Adding newsletter subscriber: ${subscriber.email}`);

      const values = [
        subscriber.email,
        subscriber.name || '',
        subscriber.subscribedAt,
        subscriber.source,
        subscriber.status,
      ];

      await this.appendRow('Newsletter', values);

      logger.info(`Successfully added subscriber: ${subscriber.email}`);
    } catch (error: any) {
      logger.error(`Failed to add subscriber ${subscriber.email}`, error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to add subscriber: ${error.message}`,
        'ADD_SUBSCRIBER_ERROR',
        500
      );
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   * Marks the subscriber as "unsubscribed" in Google Sheets
   * 
   * @param email - Email address to unsubscribe
   * @returns Object indicating if email was found and unsubscribed
   */
  async unsubscribeEmail(email: string): Promise<{ found: boolean; updated: boolean }> {
    this.ensureInitialized();

    try {
      logger.info(`Unsubscribing email: ${email}`);

      // Read all newsletter subscribers
      const rows = await this.readSheet('Newsletter', 'A2:E1000');

      // Find the row with matching email
      let rowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0]?.toLowerCase() === email.toLowerCase()) {
          rowIndex = i + 2; // +2 because we start from A2 (skip header)
          break;
        }
      }

      if (rowIndex === -1) {
        logger.warn(`Email not found in newsletter list: ${email}`);
        return { found: false, updated: false };
      }

      // Update the status column (E) to "unsubscribed"
      await this.executeWithRetry(
        async () => {
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `Newsletter!E${rowIndex}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [['unsubscribed']],
            },
          });
        },
        `unsubscribeEmail(${email})`
      );

      logger.info(`Successfully unsubscribed email: ${email}`);
      return { found: true, updated: true };
    } catch (error: any) {
      logger.error(`Failed to unsubscribe email ${email}`, error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to unsubscribe email: ${error.message}`,
        'UNSUBSCRIBE_ERROR',
        500
      );
    }
  }

  /**
   * Add a contact form submission to Google Sheets
   * Requirements: 5.2, 5.5
   * 
   * @param submission - Contact submission data to add
   */
  async addContactSubmission(submission: ContactSubmission): Promise<void> {
    this.ensureInitialized();

    try {
      logger.info(`Adding contact submission from: ${submission.email}`);

      const values = [
        submission.id,
        submission.name,
        submission.email,
        submission.subject,
        submission.message,
        submission.submittedAt,
        submission.status,
        submission.ipAddress || '',
      ];

      await this.appendRow('Contact', values);

      logger.info(`Successfully added contact submission: ${submission.id}`);
    } catch (error: any) {
      logger.error(`Failed to add contact submission ${submission.id}`, error);

      if (error instanceof RateLimitError || error instanceof GoogleSheetsError) {
        throw error;
      }

      throw new GoogleSheetsError(
        `Failed to add contact submission: ${error.message}`,
        'ADD_CONTACT_ERROR',
        500
      );
    }
  }
}

// Export a singleton instance for convenience
let serviceInstance: GoogleSheetsService | null = null;

/**
 * Get or create a singleton instance of GoogleSheetsService
 * 
 * @param spreadsheetId - Optional spreadsheet ID (uses env var if not provided)
 * @returns GoogleSheetsService instance
 */
export function getGoogleSheetsService(spreadsheetId?: string): GoogleSheetsService {
  if (!serviceInstance) {
    serviceInstance = new GoogleSheetsService(spreadsheetId);
  }
  return serviceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetGoogleSheetsService(): void {
  serviceInstance = null;
}
