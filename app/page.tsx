import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import type { Metadata } from "next";

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  title: 'Home | Colour Clouds Digital',
  description: 'Shaping Digital Experiences, One App at a Time. Innovative app development and digital content creation services from Colour Clouds Digital.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Colour Clouds Digital - Think, Build, Explore',
    description: 'Shaping Digital Experiences, One App at a Time. Innovative app development and digital content creation services.',
    type: 'website',
    url: '/',
    images: [
      {
        url: 'https://i.imghippo.com/files/tXnYf1727040648.png',
        width: 500,
        height: 500,
        alt: 'Colour Clouds Digital Hero Image',
      },
    ],
  },
};

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section - Modern Full-Screen Design */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-cc-green/5 via-cc-blue/5 to-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cc-green/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cc-blue/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 animate-slideUp">
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-cc-green/10 rounded-full text-cc-green font-medium text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Welcome to Colour Clouds Digital</span>
              </div> */}
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                Think <br />
                <span className="text-cc-green leading-tight">Build</span> <br />
                <span className="text-cc-blue leading-tight">Explore</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Shaping Digital Experiences, One App at a Time
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 items-center md:items-start">
                <Link href="/services">
                  <Button 
                    size="lg" 
                    className="bg-cc-green hover:bg-cc-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                  >
                    Start Your Digital Journey
                    <ArrowRight className="ml-2 h-5 w-5 arrow-animate" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-cc-green text-cc-green hover:bg-cc-green hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative animate-fadeIn hidden md:block">
              <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
                <div className="absolute inset-0 bg-gradient-to-br from-cc-green/20 to-cc-blue/20 rounded-2xl blur-3xl" />
                <Image
                  src="https://i.imghippo.com/files/tXnYf1727040648.png"
                  alt="Colour Clouds Digital - Digital Innovation"
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section - Modern Card Design */}
      <section className="py-20 md:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Column */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden group order-2 lg:order-1">
              <Image
                src="https://images.unsplash.com/photo-1714859100446-ed641aeea95c?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Innovative Digital Solutions"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content Column */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cc-green/10 rounded-full text-cc-green font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>Dare to Create</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Innovative App Development & Digital Content Creation
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                At Colour Clouds Digital, we're passionate about crafting digital solutions that resonate. 
                Whether you're looking to build cutting-edge applications or engage your audience with 
                compelling digital content, our team is ready to bring your vision to life.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cc-green/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-cc-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Custom App Development</h3>
                    <p className="text-gray-600">Tailored mobile and web applications built with cutting-edge technology</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cc-blue/20 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-cc-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Digital Content Creation</h3>
                    <p className="text-gray-600">Engaging content that captivates your audience and drives results</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center md:justify-start">
                <Link href="/services">
                  <Button 
                    size="lg"
                    className="bg-cc-green hover:bg-cc-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group text-white group"
                  >
                    Explore Our Services
                    <ArrowRight className="ml-2 h-5 w-5 arrow-animate" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section - Modern Gradient Design */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-cc-green via-cc-green-600 to-cc-blue text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Follow us for more project updates
              </h2>
              <p className="text-xl md:text-2xl opacity-90">
                Let's Build Your Digital Future Together
              </p>
            </div>
            
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-cc-green hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  Let's Talk
                  <ArrowRight className="ml-2 h-5 w-5 arrow-animate" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Modern Accordion Design */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cc-blue/10 dark:bg-cc-blue/20 rounded-full text-cc-blue font-semibold text-sm mb-4">
              <Target className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Here are some of our FAQs. If you have any other questions you'd like answered, 
              please feel free to contact us.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            <details className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cc-green/50 dark:hover:border-cc-green/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between font-semibold text-lg dark:text-white">
                <span>What services does Colour Clouds Digital offer?</span>
                <span className="text-cc-green transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                We specialize in app development and digital content creation, ranging from mobile 
                solutions to interactive digital platforms. Our services include custom web and mobile 
                app development, UI/UX design, video production, photography, and comprehensive digital 
                content strategies.
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cc-green/50 dark:hover:border-cc-green/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between font-semibold text-lg dark:text-white">
                <span>How can I get started with your services?</span>
                <span className="text-cc-green transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                Simply click on our "Start Your Digital Journey" button or visit our contact page. 
                We'll walk you through the process of bringing your project to life, starting with 
                a free consultation to understand your needs and goals.
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cc-green/50 dark:hover:border-cc-green/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between font-semibold text-lg dark:text-white">
                <span>Do you offer custom solutions?</span>
                <span className="text-cc-green transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                Yes! Every project is tailored to meet your unique needs and business goals. 
                We don't believe in one-size-fits-all solutions. Our team works closely with you 
                to create something that stands out and delivers real results for your business.
              </div>
            </details>

            <details className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cc-green/50 dark:hover:border-cc-green/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between font-semibold text-lg dark:text-white">
                <span>What is your typical project timeline?</span>
                <span className="text-cc-green transition-transform group-open:rotate-180">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                Project timelines vary depending on scope and complexity. A simple website might take 
                2-4 weeks, while a complex mobile app could take 3-6 months. We'll provide a detailed 
                timeline during our initial consultation and keep you updated throughout the development process.
              </div>
            </details>
          </div>

          {/* CTA at bottom of FAQ */}
          <div className="text-center mt-12 flex flex-col items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Still have questions?</p>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group border-2 border-cc-green text-cc-green hover:bg-cc-green hover:text-white dark:border-cc-green dark:text-cc-green dark:hover:bg-cc-green dark:hover:text-white transition-all duration-300"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
