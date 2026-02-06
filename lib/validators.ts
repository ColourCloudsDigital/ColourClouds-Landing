/**
 * Input Validation Utilities
 * 
 * This file contains validation functions for:
 * - Email format validation
 * - Contact form validation
 * - Newsletter form validation
 * 
 * All validators work on both client-side and server-side.
 * Requirements: 3.3, 3.4, 3.8, 5.3, 5.4, 11.1, 11.5
 */

import { ValidationError } from './types';

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Email validation regex pattern
 * Validates standard email format: local@domain.tld
 * Requirements: 3.8, 5.4
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email address format
 * 
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 * 
 * Requirements: 3.8, 5.4
 * 
 * @example
 * validateEmail('user@example.com') // returns true
 * validateEmail('invalid-email') // returns false
 * validateEmail('') // returns false
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return false;
  }
  
  // Check basic format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return false;
  }
  
  // Additional validation rules
  // Email should not be longer than 254 characters (RFC 5321)
  if (trimmedEmail.length > 254) {
    return false;
  }
  
  // Split into local and domain parts
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }
  
  const [localPart, domainPart] = parts;
  
  // Local part (before @) should not be longer than 64 characters
  if (localPart.length > 64) {
    return false;
  }
  
  // Local part validation
  // Should not start or end with a dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  
  // Should not contain consecutive dots
  if (localPart.includes('..')) {
    return false;
  }
  
  // Should only contain valid characters (alphanumeric, dots, hyphens, underscores, plus)
  if (!/^[a-zA-Z0-9.+_-]+$/.test(localPart)) {
    return false;
  }
  
  // Domain part validation
  // Should not start or end with a dot or hyphen
  if (domainPart.startsWith('.') || domainPart.endsWith('.') || 
      domainPart.startsWith('-') || domainPart.endsWith('-')) {
    return false;
  }
  
  // Should not contain consecutive dots
  if (domainPart.includes('..')) {
    return false;
  }
  
  // Should only contain valid characters (alphanumeric, dots, hyphens)
  if (!/^[a-zA-Z0-9.-]+$/.test(domainPart)) {
    return false;
  }
  
  // Domain should have at least one dot (for TLD)
  if (!domainPart.includes('.')) {
    return false;
  }
  
  // Each label in domain should not start or end with hyphen
  const domainLabels = domainPart.split('.');
  for (const label of domainLabels) {
    if (label.length === 0) {
      return false;
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// Newsletter Form Validation
// ============================================================================

/**
 * Newsletter form data interface
 */
export interface NewsletterFormData {
  email: string;
  name?: string;
  source: string;
}

/**
 * Validates newsletter subscription form data
 * 
 * @param data - Newsletter form data to validate
 * @returns Validated and normalized data
 * @throws ValidationError if validation fails
 * 
 * Requirements: 3.3, 3.4, 3.8
 * 
 * @example
 * validateNewsletterForm({ email: 'user@example.com', source: '/services' })
 * // returns { email: 'user@example.com', source: '/services' }
 * 
 * validateNewsletterForm({ email: 'invalid', source: '/services' })
 * // throws ValidationError
 */
export function validateNewsletterForm(data: NewsletterFormData): NewsletterFormData {
  const errors: Record<string, string> = {};
  
  // Validate email (required)
  if (!data.email) {
    throw new ValidationError('Email is required', 'email');
  }
  
  if (!validateEmail(data.email)) {
    throw new ValidationError('Please enter a valid email address', 'email');
  }
  
  // Validate source (required)
  if (!data.source || typeof data.source !== 'string') {
    throw new ValidationError('Source page is required', 'source');
  }
  
  // Validate name (optional, but if provided must be valid)
  if (data.name !== undefined && data.name !== null) {
    if (typeof data.name !== 'string') {
      throw new ValidationError('Name must be a string', 'name');
    }
    
    const trimmedName = data.name.trim();
    
    if (trimmedName.length > 0) {
      // Name should be between 1 and 100 characters
      if (trimmedName.length > 100) {
        throw new ValidationError('Name must be no more than 100 characters', 'name');
      }
      
      // Name should only contain letters, spaces, hyphens, and apostrophes
      if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
        throw new ValidationError('Name contains invalid characters', 'name');
      }
    }
  }
  
  // Return normalized data
  return {
    email: data.email.trim().toLowerCase(),
    name: data.name?.trim() || undefined,
    source: data.source.trim(),
  };
}

// ============================================================================
// Contact Form Validation
// ============================================================================

/**
 * Contact form data interface
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Validates contact form submission data
 * 
 * @param data - Contact form data to validate
 * @returns Validated and normalized data
 * @throws ValidationError if validation fails
 * 
 * Requirements: 5.3, 5.4, 11.1, 11.5
 * 
 * @example
 * validateContactForm({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   subject: 'Inquiry',
 *   message: 'Hello world'
 * })
 * // returns normalized data
 * 
 * validateContactForm({ name: '', email: '', subject: '', message: '' })
 * // throws ValidationError for missing required field
 */
export function validateContactForm(data: ContactFormData): ContactFormData {
  // Validate name (required)
  if (!data.name || typeof data.name !== 'string') {
    throw new ValidationError('Name is required', 'name');
  }
  
  const trimmedName = data.name.trim();
  
  if (trimmedName.length === 0) {
    throw new ValidationError('Name is required', 'name');
  }
  
  if (trimmedName.length < 2) {
    throw new ValidationError('Name must be at least 2 characters', 'name');
  }
  
  if (trimmedName.length > 100) {
    throw new ValidationError('Name must be no more than 100 characters', 'name');
  }
  
  // Validate email (required)
  if (!data.email || typeof data.email !== 'string') {
    throw new ValidationError('Email is required', 'email');
  }
  
  if (!validateEmail(data.email)) {
    throw new ValidationError('Please enter a valid email address', 'email');
  }
  
  // Validate subject (required)
  if (!data.subject || typeof data.subject !== 'string') {
    throw new ValidationError('Subject is required', 'subject');
  }
  
  const trimmedSubject = data.subject.trim();
  
  if (trimmedSubject.length === 0) {
    throw new ValidationError('Subject is required', 'subject');
  }
  
  if (trimmedSubject.length < 3) {
    throw new ValidationError('Subject must be at least 3 characters', 'subject');
  }
  
  if (trimmedSubject.length > 200) {
    throw new ValidationError('Subject must be no more than 200 characters', 'subject');
  }
  
  // Validate message (required)
  if (!data.message || typeof data.message !== 'string') {
    throw new ValidationError('Message is required', 'message');
  }
  
  const trimmedMessage = data.message.trim();
  
  if (trimmedMessage.length === 0) {
    throw new ValidationError('Message is required', 'message');
  }
  
  if (trimmedMessage.length < 10) {
    throw new ValidationError('Message must be at least 10 characters', 'message');
  }
  
  if (trimmedMessage.length > 5000) {
    throw new ValidationError('Message must be no more than 5000 characters', 'message');
  }
  
  // Return normalized data
  return {
    name: trimmedName,
    email: data.email.trim().toLowerCase(),
    subject: trimmedSubject,
    message: trimmedMessage,
  };
}

// ============================================================================
// Utility Validation Functions
// ============================================================================

/**
 * Validates that a string is not empty after trimming
 * 
 * @param value - String to validate
 * @param fieldName - Name of the field for error messages
 * @throws ValidationError if string is empty
 */
export function validateRequired(value: string, fieldName: string): void {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

/**
 * Validates string length constraints
 * 
 * @param value - String to validate
 * @param fieldName - Name of the field for error messages
 * @param min - Minimum length (optional)
 * @param max - Maximum length (optional)
 * @throws ValidationError if length constraints are violated
 */
export function validateLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): void {
  const trimmedValue = value.trim();
  
  if (min !== undefined && trimmedValue.length < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min} characters`,
      fieldName
    );
  }
  
  if (max !== undefined && trimmedValue.length > max) {
    throw new ValidationError(
      `${fieldName} must be no more than ${max} characters`,
      fieldName
    );
  }
}

/**
 * Validates that a value matches a regex pattern
 * 
 * @param value - String to validate
 * @param pattern - Regex pattern to match
 * @param fieldName - Name of the field for error messages
 * @param errorMessage - Custom error message
 * @throws ValidationError if pattern doesn't match
 */
export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string,
  errorMessage: string
): void {
  if (!pattern.test(value)) {
    throw new ValidationError(errorMessage, fieldName);
  }
}
