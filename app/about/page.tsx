/**
 * About Page
 * 
 * Features:
 * - Company story and mission statement
 * - Vision statement
 * - Company values/principles
 * - Team member profiles (optional)
 * - Responsive design for mobile, tablet, desktop
 * 
 * Requirements: 1.3, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/breadcrumb"
import { 
  Target, 
  Eye, 
  Heart, 
  Lightbulb, 
  Users, 
  Award,
  ArrowRight,
  Sparkles
} from "lucide-react"
import type { Metadata } from "next"

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'About Us | Colour Clouds Digital',
  description: 'Learn about Colour Clouds Digital - our story, mission, vision, and values. We are passionate about creating innovative digital solutions that make a difference.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Colour Clouds Digital',
    description: 'Learn about Colour Clouds Digital - our story, mission, vision, and values. We are passionate about creating innovative digital solutions that make a difference.',
    type: 'website',
    url: '/about',
  },
}

// ============================================================================
// Company Values Data
// ============================================================================

const companyValues = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly push boundaries and explore new technologies to deliver cutting-edge solutions that keep our clients ahead of the curve.",
    color: "#01A750"
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We love what we do, and it shows in every project. Our enthusiasm drives us to exceed expectations and create exceptional work.",
    color: "#0072FF"
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "We believe in the power of teamwork. By working closely with our clients and each other, we achieve remarkable results.",
    color: "#01A750"
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Quality is non-negotiable. We're committed to delivering the highest standards in everything we create.",
    color: "#0072FF"
  },
  {
    icon: Target,
    title: "Client-Focused",
    description: "Your success is our success. We prioritize understanding your needs and delivering solutions that drive real results.",
    color: "#01A750"
  },
  {
    icon: Sparkles,
    title: "Creativity",
    description: "We bring fresh perspectives and creative thinking to every challenge, turning ideas into impactful digital experiences.",
    color: "#0072FF"
  }
]

// ============================================================================
// Component
// ============================================================================

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      {/* Requirement: 10.3 - Display breadcrumb navigation showing Home > About */}
      <div className="bg-white dark:bg-[#03050c] border-b border-gray-200 dark:border-transparent">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#01A750]/10 via-[#0072FF]/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              About <span className="text-[#01A750]">Colour Clouds</span> Digital
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              We're a passionate team of digital creators, developers, and innovators 
              dedicated to bringing your vision to life through technology and creativity.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Image */}
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden order-2 lg:order-1">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2942&auto=format&fit=crop"
                  alt="Team working together"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>

              {/* Right Column - Content */}
              <div className="order-1 lg:order-2">
                <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-[#01A750] bg-[#01A750]/10 rounded-full">
                  Our Story
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Building Digital Dreams Since Day One
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Colour Clouds Digital was born from a simple belief: that technology and creativity 
                    can transform businesses and bring ideas to life in ways that truly matter.
                  </p>
                  <p>
                    What started as a small team of passionate developers and content creators has grown 
                    into a full-service digital agency. We've worked with startups, established businesses, 
                    and everyone in between, helping them navigate the digital landscape and achieve their goals.
                  </p>
                  <p>
                    Today, we continue to push boundaries, embrace new technologies, and create digital 
                    experiences that make a real impact. Our journey is driven by our clients' success 
                    stories and our commitment to excellence in everything we do.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className="bg-card rounded-lg border border-border p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-lg bg-[#01A750]/10 flex items-center justify-center">
                    <Target className="h-7 w-7 text-[#01A750]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To empower businesses and individuals with innovative digital solutions that drive 
                  growth, enhance user experiences, and create lasting value. We're committed to 
                  delivering excellence through cutting-edge technology and creative storytelling.
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-card rounded-lg border border-border p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-lg bg-[#0072FF]/10 flex items-center justify-center">
                    <Eye className="h-7 w-7 text-[#0072FF]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To be the leading digital partner for businesses seeking to thrive in the digital age. 
                  We envision a world where technology and creativity seamlessly merge to create 
                  experiences that inspire, engage, and transform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold text-[#01A750] bg-[#01A750]/10 rounded-full">
                Our Values
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                What Drives Us Forward
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our core values guide every decision we make and every project we undertake. 
                They're the foundation of who we are and how we work.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {companyValues.map((value, index) => (
                <div
                  key={index}
                  className="group bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-300"
                  style={{
                    borderColor: `${value.color}20`,
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                    style={{
                      backgroundColor: `${value.color}15`,
                    }}
                  >
                    <value.icon 
                      className="h-6 w-6" 
                      style={{ color: value.color }}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[#01A750] to-[#0072FF] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Let's Create Something Amazing Together
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Ready to start your digital journey? We'd love to hear about your project 
              and explore how we can help bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="bg-white text-cc-green hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4 arrow-animate" />
                </Button>
              </Link>
              <Link href="/services">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-cc-green transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  View Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
