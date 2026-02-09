import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb component for navigation hierarchy
 * Implements Requirements 10.4, 10.5
 * 
 * Features:
 * - Dynamic breadcrumb generation based on items prop
 * - Structured data markup (JSON-LD) for SEO
 * - Accessible navigation with aria-labels
 * - Consistent styling with brand colors
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  // Generate structured data for SEO (JSON-LD format)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://colourclouds.digital'}${item.href}`
    }))
  };

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb navigation"
        className="w-full py-3 px-4"
      >
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.href} className="flex items-center space-x-2">
                {index > 0 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                
                {isLast ? (
                  <span
                    className="text-gray-600 font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-cc-blue hover:text-cc-green transition-colors duration-200 hover:underline"
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
