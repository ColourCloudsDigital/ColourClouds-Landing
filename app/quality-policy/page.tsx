/**
 * Quality Policy Page
 * 
 * Features:
 * - INAN Management Quality Policy Statement
 * - Professional document layout
 * - Responsive design for mobile, tablet, desktop
 * - Dark mode support
 * - Breadcrumb navigation
 * 
 * Requirements: Company policy documentation
 */

import * as React from "react"
import { Breadcrumb } from "@/components/breadcrumb"
import { FileText, CheckCircle2 } from "lucide-react"
import type { Metadata } from "next"

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Quality Policy | Colour Clouds Digital',
  description: 'INAN Management Quality Policy Statement - Our commitment to excellence, innovation, and customer satisfaction.',
  alternates: {
    canonical: '/quality-policy',
  },
  openGraph: {
    title: 'Quality Policy | Colour Clouds Digital',
    description: 'INAN Management Quality Policy Statement - Our commitment to excellence, innovation, and customer satisfaction.',
    type: 'website',
    url: '/quality-policy',
  },
}

// ============================================================================
// Component
// ============================================================================

export default function QualityPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-[#03050c] border-b border-gray-200 dark:border-transparent">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Quality Policy', href: '/quality-policy' },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#01A750]/10 via-[#0072FF]/10 to-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-[#01A750]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-[#01A750]" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Quality Policy Statement
            </h1>
            <p className="text-lg text-muted-foreground">
              INAN Management's commitment to excellence and customer satisfaction
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main Policy Card */}
            <div className="bg-card rounded-lg border border-border p-8 md:p-12 shadow-sm">
              {/* Introduction */}
              <div className="mb-8">
                <p className="text-lg leading-relaxed text-foreground">
                  At <strong>INAN Management</strong>, we are more than just a management solutions provider. 
                  We are a team of dedicated professionals committed to empowering businesses like yours to 
                  thrive in today's dynamic market. With a focus on innovation, integrity, and excellence, 
                  we deliver tailored solutions that drive growth, enhance efficiency, and foster success. 
                  Our passion for helping clients achieve their goals is at the center of everything we do, 
                  and we look forward to partnering with you on your journey to success.
                </p>
              </div>

              {/* Commitment Statement */}
              <div className="bg-[#01A750]/5 border-l-4 border-[#01A750] rounded-r-lg p-6 mb-8">
                <p className="text-base leading-relaxed text-foreground italic">
                  "To achieve the above feat, we are committed to ensure adherence to and satisfaction of 
                  customers, and other relevant interested parties; all relevant and applicable requirements; 
                  and the continual improvement of the QMS by constantly reviewing the elements of this policy 
                  for suitability during management review meetings".
                </p>
              </div>

              {/* Policy Details */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#01A750] flex-shrink-0 mt-1" />
                  <p className="text-base leading-relaxed text-foreground">
                    This statement of our commitment is appropriate to the scope and nature of our operations 
                    defined in the Scope of our Integrated Management System (IMS); the Context of our 
                    Organization as detailed in our Apex Manual, Context of the Organization Procedure, 
                    Internal & External Issues, the Needs & Expectations of our relevant Interested Parties; 
                    and also supports our strategic direction as detailed in the Business Plan.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#01A750] flex-shrink-0 mt-1" />
                  <p className="text-base leading-relaxed text-foreground">
                    This policy statement provides a framework for the establishment and reviewing of the 
                    quality objectives which shall be developed by each process head and approved by top management.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#01A750] flex-shrink-0 mt-1" />
                  <p className="text-base leading-relaxed text-foreground">
                    This policy statement is communicated and understood by all personnel and applied within 
                    the organization. It is also available to relevant interested parties as appropriate to 
                    our organization and maintained as documented information.
                  </p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="border-t border-border pt-8 mt-12">
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-full">
                    <div className="border-b-2 border-gray-300 dark:border-gray-600 w-64 mb-2"></div>
                    <p className="font-bold text-lg text-foreground">ALFONZO OSUNDE</p>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Managing Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 bg-muted/30 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3 text-foreground">About INAN Management</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                INAN Management is committed to delivering excellence in management solutions. 
                Colour Clouds Digital operates as a subsidiary of INAN Management, bringing innovative 
                digital solutions and app development services to businesses worldwide.
              </p>
              <p className="text-sm text-muted-foreground">
                For more information about our services, please{' '}
                <a href="/contact" className="text-cc-blue hover:underline">
                  contact us
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
