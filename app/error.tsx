"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Error Icon/Number */}
        <div className="space-y-4">
          <div className="text-8xl sm:text-9xl font-bold">
            <span className="text-cc-red">500</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Something Went Wrong
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working on it.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-left max-w-lg mx-auto">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            size="lg"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Go Home
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Need help?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/contact" className="text-cc-blue hover:underline">
              Contact Support
            </Link>
            <Link href="/blog" className="text-cc-blue hover:underline">
              Visit Blog
            </Link>
            <Link href="/services" className="text-cc-blue hover:underline">
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
