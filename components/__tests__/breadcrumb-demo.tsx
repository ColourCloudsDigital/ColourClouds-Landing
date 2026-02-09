/**
 * Breadcrumb Demo Component
 * 
 * This file demonstrates various breadcrumb configurations
 * for testing and visual verification purposes.
 */

import React from 'react';
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb';

export function BreadcrumbDemo() {
  // Example 1: Blog post breadcrumb
  const blogPostBreadcrumb: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Building Modern Portfolios', href: '/blog/building-modern-portfolios' }
  ];

  // Example 2: Services page breadcrumb
  const servicesBreadcrumb: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' }
  ];

  // Example 3: About page breadcrumb
  const aboutBreadcrumb: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ];

  // Example 4: Contact page breadcrumb
  const contactBreadcrumb: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Contact', href: '/contact' }
  ];

  // Example 5: Deep nested breadcrumb
  const deepBreadcrumb: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'App Development', href: '/services/app-development' },
    { label: 'Mobile Apps', href: '/services/app-development/mobile' }
  ];

  return (
    <div className="space-y-8 p-8 bg-gray-50">
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Blog Post Breadcrumb</h2>
        <div className="bg-white rounded-lg shadow">
          <Breadcrumb items={blogPostBreadcrumb} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Services Page Breadcrumb</h2>
        <div className="bg-white rounded-lg shadow">
          <Breadcrumb items={servicesBreadcrumb} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">About Page Breadcrumb</h2>
        <div className="bg-white rounded-lg shadow">
          <Breadcrumb items={aboutBreadcrumb} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Contact Page Breadcrumb</h2>
        <div className="bg-white rounded-lg shadow">
          <Breadcrumb items={contactBreadcrumb} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Deep Nested Breadcrumb</h2>
        <div className="bg-white rounded-lg shadow">
          <Breadcrumb items={deepBreadcrumb} />
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Features Demonstrated:</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Dynamic breadcrumb generation</li>
          <li>Brand colors (cc-blue links, cc-green hover)</li>
          <li>Accessible navigation with aria-labels</li>
          <li>SEO-optimized structured data (JSON-LD)</li>
          <li>Responsive design</li>
          <li>Proper separators between items</li>
          <li>Current page indication</li>
        </ul>
      </div>
    </div>
  );
}
