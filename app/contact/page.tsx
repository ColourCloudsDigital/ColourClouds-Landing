"use client"

/**
 * Enhanced Contact Page
 * 
 * Features:
 * - Contact form with fields: name, email, subject, message
 * - Client-side validation with real-time feedback
 * - Loading states during submission
 * - Success/error toast notifications using Sonner
 * - Contact information display (email, phone, social media)
 * - Mailto link and click-to-call functionality
 * - Spam protection (honeypot field, timestamp validation)
 * - Accessible form labels and error messages
 * 
 * Requirements: 5.1, 5.6, 5.7, 5.9, 5.10, 9.2, 9.4
 */

import * as React from "react"
import { toast } from "sonner"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { validateEmail } from "@/lib/validators"
import { Mail, Phone, MessageSquare } from "lucide-react"

// ============================================================================
// Types
// ============================================================================

interface FormState {
  name: string
  email: string
  subject: string
  message: string
  honeypot: string // Spam protection field (hidden from users)
  timestamp: number // Form load timestamp for spam protection
  isSubmitting: boolean
  errors: {
    name?: string
    email?: string
    subject?: string
    message?: string
    general?: string
  }
}

// ============================================================================
// Contact Information
// ============================================================================

const CONTACT_INFO = {
  email: 'colourclouds042@gmail.com',
  phone: '+234 (811) 3708 920', 
  social: {
    linkedin: 'https://www.linkedin.com/company/colour-clouds-ng/?viewAsMember=true',
    facebook: 'https://www.facebook.com/share/19kf8hGM91/',
    github: 'https://github.com/ColourClouds-dev',
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ContactPage() {
  // reCAPTCHA hook
  const { executeRecaptcha } = useGoogleReCaptcha()

  // Form state management
  const [formState, setFormState] = React.useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
    timestamp: Date.now(),
    isSubmitting: false,
    errors: {},
  })

  // Reset timestamp when component mounts
  React.useEffect(() => {
    setFormState(prev => ({
      ...prev,
      timestamp: Date.now(),
    }))
  }, [])

  // ============================================================================
  // Validation Functions
  // ============================================================================

  /**
   * Validates the name field
   * Requirements: 5.3
   */
  const validateNameField = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Name is required'
    }
    
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters'
    }
    
    if (name.trim().length > 100) {
      return 'Name must be no more than 100 characters'
    }
    
    return undefined
  }

  /**
   * Validates the email field
   * Requirements: 5.4
   */
  const validateEmailField = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required'
    }
    
    if (!validateEmail(email)) {
      return 'Please enter a valid email address'
    }
    
    return undefined
  }

  /**
   * Validates the subject field
   * Requirements: 5.3
   */
  const validateSubjectField = (subject: string): string | undefined => {
    if (!subject.trim()) {
      return 'Subject is required'
    }
    
    if (subject.trim().length < 3) {
      return 'Subject must be at least 3 characters'
    }
    
    if (subject.trim().length > 200) {
      return 'Subject must be no more than 200 characters'
    }
    
    return undefined
  }

  /**
   * Validates the message field
   * Requirements: 5.3
   */
  const validateMessageField = (message: string): string | undefined => {
    if (!message.trim()) {
      return 'Message is required'
    }
    
    if (message.trim().length < 10) {
      return 'Message must be at least 10 characters'
    }
    
    if (message.trim().length > 5000) {
      return 'Message must be no more than 5000 characters'
    }
    
    return undefined
  }

  /**
   * Validates all form fields
   * Returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const nameError = validateNameField(formState.name)
    const emailError = validateEmailField(formState.email)
    const subjectError = validateSubjectField(formState.subject)
    const messageError = validateMessageField(formState.message)
    
    setFormState(prev => ({
      ...prev,
      errors: {
        name: nameError,
        email: emailError,
        subject: subjectError,
        message: messageError,
      },
    }))
    
    return !nameError && !emailError && !subjectError && !messageError
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handles input change with real-time validation clearing
   */
  const handleInputChange = (
    field: keyof FormState,
    value: string
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined,
        general: undefined,
      },
    }))
  }

  /**
   * Handles form submission
   * Requirements: 5.2, 5.6, 5.7, 9.2, 9.4
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }

    // Check if reCAPTCHA is available
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not yet loaded')
      toast.error('Security Check Failed', {
        description: 'Please wait a moment and try again.',
      })
      return
    }
    
    // Set loading state
    // Requirements: 9.2
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
    }))
    
    try {
      // Execute reCAPTCHA challenge
      const recaptchaToken = await executeRecaptcha('contact_submit')

      // Submit to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          subject: formState.subject.trim(),
          message: formState.message.trim(),
          honeypot: formState.honeypot, // Spam protection
          timestamp: formState.timestamp, // Spam protection
          recaptchaToken, // reCAPTCHA token
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        // Handle API errors
        // Requirements: 5.7, 9.4
        const errorMessage = data.error || 'Failed to submit. Please try again.'
        
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: {
            [data.field || 'general']: errorMessage,
          },
        }))
        
        // Show error toast
        toast.error('Submission Failed', {
          description: errorMessage,
        })
        
        return
      }
      
      // Success!
      // Requirements: 5.6
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
        timestamp: Date.now(),
        isSubmitting: false,
        errors: {},
      })
      
      // Show success toast
      toast.success('Message Sent Successfully!', {
        description: 'Thank you for contacting us. We\'ll get back to you soon.',
      })
      
    } catch (error) {
      // Handle network errors
      // Requirements: 5.7, 9.4
      const errorMessage = 'Network error. Please check your connection and try again.'
      
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: {
          general: errorMessage,
        },
      }))
      
      toast.error('Connection Error', {
        description: errorMessage,
      })
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your full name"
                    value={formState.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={formState.isSubmitting}
                    aria-invalid={!!formState.errors.name}
                    aria-describedby={
                      formState.errors.name ? 'contact-name-error' : undefined
                    }
                    className={cn({
                      'border-destructive focus-visible:ring-destructive': formState.errors.name,
                    })}
                    required
                  />
                  {formState.errors.name && (
                    <p
                      id="contact-name-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {formState.errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formState.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={formState.isSubmitting}
                    aria-invalid={!!formState.errors.email}
                    aria-describedby={
                      formState.errors.email ? 'contact-email-error' : undefined
                    }
                    className={cn({
                      'border-destructive focus-visible:ring-destructive': formState.errors.email,
                    })}
                    required
                  />
                  {formState.errors.email && (
                    <p
                      id="contact-email-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {formState.errors.email}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label htmlFor="contact-subject" className="text-sm font-medium">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-subject"
                    type="text"
                    placeholder="What is this regarding?"
                    value={formState.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    disabled={formState.isSubmitting}
                    aria-invalid={!!formState.errors.subject}
                    aria-describedby={
                      formState.errors.subject ? 'contact-subject-error' : undefined
                    }
                    className={cn({
                      'border-destructive focus-visible:ring-destructive': formState.errors.subject,
                    })}
                    required
                  />
                  {formState.errors.subject && (
                    <p
                      id="contact-subject-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {formState.errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us about your project or inquiry..."
                    rows={6}
                    value={formState.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    disabled={formState.isSubmitting}
                    aria-invalid={!!formState.errors.message}
                    aria-describedby={
                      formState.errors.message ? 'contact-message-error' : undefined
                    }
                    className={cn({
                      'border-destructive focus-visible:ring-destructive': formState.errors.message,
                    })}
                    required
                  />
                  {formState.errors.message && (
                    <p
                      id="contact-message-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {formState.errors.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formState.message.length} / 5000 characters
                  </p>
                </div>

                {/* Honeypot Field - Hidden from users for spam protection */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="contact-website">Website</Label>
                  <Input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formState.honeypot}
                    onChange={(e) => handleInputChange('honeypot', e.target.value)}
                  />
                </div>

                {/* General Error Message */}
                {formState.errors.general && (
                  <div
                    className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                    role="alert"
                  >
                    {formState.errors.general}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {formState.isSubmitting ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>

                {/* reCAPTCHA Notice */}
                <p className="text-xs text-muted-foreground text-center">
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Terms of Service
                  </a>{' '}
                  apply.
                </p>
              </form>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Direct Contact Card */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-cc-green mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </p>
                    <a
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="text-sm text-foreground hover:text-cc-green transition-colors break-all"
                    >
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-cc-blue mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Phone
                    </p>
                    <a
                      href={`tel:${CONTACT_INFO.phone.replace(/\D/g, '')}`}
                      className="text-sm text-foreground hover:text-cc-blue transition-colors"
                    >
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Follow Us</h2>
              
              <div className="space-y-3">

                {/* Facebook */}
                <a
                  href={CONTACT_INFO.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-sm hover:text-cc-green transition-colors group"
                >
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Facebook</span>
                </a>

               {/* LinkedIn */}
                <a
                  href={CONTACT_INFO.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-sm hover:text-cc-blue transition-colors group"
                >
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>

                {/* GitHub */}
                <a
                  href={CONTACT_INFO.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-sm hover:text-cc-green transition-colors group"
                >
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Business Hours Card (Optional) */}
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Business Hours</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * All times are in WAT (West African Time)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
