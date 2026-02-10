import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Colour Clouds Digital",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Number */}
        <div className="space-y-4">
          <h1 className="text-8xl sm:text-9xl font-bold">
            <span className="text-cc-green">4</span>
            <span className="text-cc-blue">0</span>
            <span className="text-cc-red">4</span>
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Oops! The page you&apos;re looking for seems to have wandered off into the digital clouds.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              Go Home
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Browse Blog
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/services" className="text-cc-blue hover:underline">
              Services
            </Link>
            <Link href="/about" className="text-cc-blue hover:underline">
              About Us
            </Link>
            <Link href="/contact" className="text-cc-blue hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
