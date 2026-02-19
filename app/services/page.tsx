/**
 * Services Page
 * 
 * Features:
 * - Hero section with value proposition
 * - Service sections for app development and digital content creation
 * - Service descriptions with icons/images
 * - Call-to-action buttons linking to /contact
 * - Responsive design for mobile, tablet, desktop
 * 
 * Requirements: 1.2, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/breadcrumb"
import { 
  Smartphone, 
  Globe, 
  Code, 
  Palette, 
  Video, 
  Camera,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import type { Metadata } from "next"

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Services | Colour Clouds Digital',
  description: 'Professional app development and digital content creation services. We build cutting-edge applications and create compelling digital content that engages your audience.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Services | Colour Clouds Digital',
    description: 'Professional app development and digital content creation services. We build cutting-edge applications and create compelling digital content that engages your audience.',
    type: 'website',
    url: '/services',
  },
}

// ============================================================================
// Service Data
// ============================================================================

const appDevelopmentServices = [
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications for iOS and Android. We create intuitive, high-performance apps that users love.",
    features: [
      "iOS & Android Development",
      "Cross-platform Solutions",
      "App Store Optimization",
      "Ongoing Maintenance & Support"
    ]
  },
  {
    icon: Globe,
    title: "Web Application Development",
    description: "Modern, responsive web applications built with cutting-edge technologies. From simple websites to complex web platforms.",
    features: [
      "Responsive Web Design",
      "Progressive Web Apps (PWA)",
      "E-commerce Solutions",
      "Custom Web Platforms"
    ]
  },
  {
    icon: Code,
    title: "API & Backend Development",
    description: "Robust backend systems and APIs that power your applications. Scalable, secure, and optimized for performance.",
    features: [
      "RESTful API Development",
      "Database Design & Optimization",
      "Cloud Infrastructure Setup",
      "Third-party Integrations"
    ]
  },
  {
    icon: Zap,
    title: "UI/UX Design",
    description: "Beautiful, user-centered designs that enhance user experience and drive engagement. We make your apps not just functional, but delightful.",
    features: [
      "User Interface Design",
      "User Experience Research",
      "Prototyping & Wireframing",
      "Design System Creation"
    ]
  }
]

const digitalContentServices = [
  {
    icon: Video,
    title: "Video Production",
    description: "Professional video content that tells your story and captivates your audience. From concept to final edit.",
    features: [
      "Promotional Videos",
      "Product Demonstrations",
      "Social Media Content",
      "Animation & Motion Graphics"
    ]
  },
  {
    icon: Camera,
    title: "Photography",
    description: "High-quality photography services for your brand, products, and events. We capture moments that matter.",
    features: [
      "Product Photography",
      "Brand Photography",
      "Event Coverage",
      "Photo Editing & Retouching"
    ]
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description: "Eye-catching visual designs that communicate your brand message effectively across all platforms.",
    features: [
      "Brand Identity Design",
      "Marketing Materials",
      "Social Media Graphics",
      "Print & Digital Design"
    ]
  },
  {
    icon: Users,
    title: "Content Strategy",
    description: "Strategic content planning and creation that resonates with your target audience and achieves your business goals.",
    features: [
      "Content Planning",
      "Copywriting",
      "Social Media Management",
      "Content Marketing"
    ]
  }
]

// ============================================================================
// Component
// ============================================================================

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      {/* Requirement: 10.2 - Display breadcrumb navigation showing Home > Services */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/services' },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#01A750]/10 via-[#0072FF]/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Our <span className="text-[#01A750]">Services</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              We specialize in creating innovative digital solutions that drive results. 
              From cutting-edge app development to compelling digital content, 
              we bring your vision to life with expertise and creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button size="lg" className="bg-cc-green hover:bg-cc-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4 arrow-animate" />
                </Button>
              </Link>
              <Link href="/inators">
                <Button size="lg" variant="outline" className="border-2 border-cc-green text-cc-green hover:bg-cc-green hover:text-white transition-all duration-300 hover:scale-105 active:scale-95">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* App Development Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-[#01A750] bg-[#01A750]/10 rounded-full">
              App Development
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Build Powerful Applications
            </h2>
            <p className="text-lg text-muted-foreground">
              We create robust, scalable applications that solve real problems and deliver exceptional user experiences.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
            {appDevelopmentServices.map((service, index) => (
              <div
                key={index}
                className="group bg-card rounded-lg border border-border p-6 md:p-8 hover:shadow-lg transition-all duration-300 hover:border-[#01A750]/50"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#01A750]/10 flex items-center justify-center group-hover:bg-[#01A750]/20 transition-colors">
                    <service.icon className="h-6 w-6 text-[#01A750]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-2 mt-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#01A750] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 flex justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-cc-green hover:bg-cc-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group">
                Discuss Your App Project
                <ArrowRight className="ml-2 h-4 w-4 arrow-animate" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Digital Content Creation Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
            <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-[#0072FF] bg-[#0072FF]/10 rounded-full">
              Digital Content Creation
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Create Engaging Content
            </h2>
            <p className="text-lg text-muted-foreground">
              Captivate your audience with professional digital content that tells your story and drives engagement.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
            {digitalContentServices.map((service, index) => (
              <div
                key={index}
                className="group bg-card rounded-lg border border-border p-6 md:p-8 hover:shadow-lg transition-all duration-300 hover:border-[#0072FF]/50"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#0072FF]/10 flex items-center justify-center group-hover:bg-[#0072FF]/20 transition-colors">
                    <service.icon className="h-6 w-6 text-[#0072FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                
                <ul className="space-y-2 mt-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#0072FF] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 flex justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-cc-blue hover:bg-cc-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group">
                Start Creating Content
                <ArrowRight className="ml-2 h-4 w-4 arrow-animate" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Image */}
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop"
                  alt="Team collaboration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>

              {/* Right Column - Content */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Choose Colour Clouds Digital?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We're not just service providers – we're your partners in digital success. 
                  Here's what sets us apart:
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#01A750]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#01A750]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Expert Team</h3>
                      <p className="text-muted-foreground">
                        Our talented team brings years of experience and cutting-edge expertise to every project.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0072FF]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#0072FF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Tailored Solutions</h3>
                      <p className="text-muted-foreground">
                        Every project is unique. We customize our approach to meet your specific needs and goals.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#01A750]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#01A750]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Quality Focused</h3>
                      <p className="text-muted-foreground">
                        We're committed to delivering exceptional quality in everything we create.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0072FF]/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#0072FF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Ongoing Support</h3>
                      <p className="text-muted-foreground">
                        Our relationship doesn't end at delivery. We provide continuous support and maintenance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#01A750] to-[#0072FF] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Bring Your Vision to Life?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Let's discuss how we can help you achieve your digital goals. 
              Get in touch today for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="bg-white text-cc-green hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4 arrow-animate" />
                </Button>
              </Link>
              <Link href="/blog">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-cc-green transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  View Our Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
