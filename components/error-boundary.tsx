"use client"

/**
 * Error Boundary Component
 * 
 * A React error boundary that catches JavaScript errors anywhere in the child
 * component tree, logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 * 
 * Features:
 * - Catches and handles React component errors gracefully
 * - Displays user-friendly fallback UI
 * - Provides error details in development mode
 * - Allows users to attempt recovery by resetting the error state
 * - Consistent styling with brand colors
 * 
 * Requirements: 9.5
 */

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: React.ReactNode
  
  /** Optional custom fallback UI */
  fallback?: React.ComponentType<ErrorFallbackProps>
  
  /** Callback function called when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  
  /** Additional CSS classes for the error container */
  className?: string
}

export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error
  
  /** Function to reset the error boundary and retry rendering */
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// ============================================================================
// Default Fallback Component
// ============================================================================

/**
 * Default fallback UI displayed when an error is caught
 * 
 * Features:
 * - User-friendly error message
 * - Error details in development mode
 * - Reset button to attempt recovery
 * - Consistent styling with brand colors
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-destructive"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600">
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <h3 className="mb-2 text-sm font-semibold text-destructive">
              Error Details (Development Only)
            </h3>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 max-h-32 overflow-auto text-xs text-gray-600">
                  {error.stack}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={resetError}
            className="bg-cc-green hover:bg-cc-green/90"
            size="lg"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
          >
            Go to Home
          </Button>
        </div>

        {/* Support Information */}
        <p className="text-xs text-gray-500">
          Need help?{' '}
          <a
            href="/contact"
            className="text-cc-blue hover:text-cc-green hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Error Boundary Component
// ============================================================================

/**
 * Error Boundary Component
 * 
 * Catches errors in child components and displays a fallback UI.
 * 
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={CustomErrorFallback}>
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * @example
 * // With error callback
 * <ErrorBoundary onError={(error, errorInfo) => {
 *   console.error('Error caught:', error, errorInfo)
 * }}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  /**
   * Update state when an error is caught
   * Requirements: 9.5
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  /**
   * Log error details and call optional error callback
   * Requirements: 9.5
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  /**
   * Reset error state to attempt recovery
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback: FallbackComponent, className } = this.props

    // If there's an error, render the fallback UI
    if (hasError && error) {
      const Fallback = FallbackComponent || DefaultErrorFallback

      return (
        <div className={cn('error-boundary-container', className)}>
          <Fallback error={error} resetError={this.resetError} />
        </div>
      )
    }

    // Otherwise, render children normally
    return children
  }
}

// ============================================================================
// Utility Hook for Functional Components
// ============================================================================

/**
 * Hook to manually trigger error boundary from functional components
 * 
 * @example
 * function MyComponent() {
 *   const throwError = useErrorHandler()
 *   
 *   const handleClick = () => {
 *     try {
 *       // Some risky operation
 *     } catch (error) {
 *       throwError(error)
 *     }
 *   }
 *   
 *   return <button onClick={handleClick}>Do Something</button>
 * }
 */
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null)

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
