/**
 * Modern Main Footer Component
 * 
 * Features:
 * - Links to all pages (Home, Services, About, Blog, Contact)
 * - Newsletter subscription form
 * - Social media links with hover effects
 * - Responsive design with modern styling
 * - Smooth animations and transitions
 * 
 * Requirements: 1.8
 */

import React from 'react'
import Link from 'next/link'
import { NewsletterForm } from './newsletter-form'
import { Mail, Github, Twitter, Linkedin, Instagram, Facebook, ArrowRight } from 'lucide-react'
import CcLogo from '../app/cc-logo.svg';

const MainFooter = () => {
  const footerLinks = [
    { title: "Home", path: "/" },
    { title: "Services", path: "/services" },
    { title: "About", path: "/about" },
    { title: "Blog", path: "/blog" },
    { title: "Contact", path: "/contact" },
  ]

  const socialLinks = [
    {
      name: "Email",
      href: "mailto:colourclouds042@gmail.com",
      icon: Mail,
      color: "hover:bg-cc-green"
    },
    {
      name: "GitHub",
      href: "https://github.com/ColourClouds-dev",
      icon: Github,
      color: "hover:bg-gray-700"
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/share/19kf8hGM91/",
      icon: Facebook,
      color: "hover:bg-blue-600"
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/colour-clouds-ng/?viewAsMember=true",
      icon: Linkedin,
      color: "hover:bg-cc-blue"
    }
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link
                href="/"
                className="inline-block mb-6 group transition-transform hover:scale-105 duration-300"
              >
                    <CcLogo className="w-[120px] h-auto" />
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Creating innovative digital solutions through app development and content creation. 
                Transforming ideas into impactful digital experiences.
              </p>
              
              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target={social.name !== "Email" ? "_blank" : undefined}
                      rel={social.name !== "Email" ? "noopener noreferrer" : undefined}
                      title={social.name}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-400 ${social.color} hover:text-white transition-all duration-300 hover:scale-110 active:scale-95`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:text-center">
              <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {footerLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.path}
                      className="text-gray-400 hover:text-cc-green transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      <span>{link.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Contact</h3>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="mailto:colourclouds042@gmail.com"
                    className="text-gray-400 hover:text-cc-green transition-colors duration-200 flex items-start gap-2 group"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="break-all">colourclouds042@gmail.com</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:info@colourclouds.ng"
                    className="text-gray-400 hover:text-cc-green transition-colors duration-200 flex items-start gap-2 group"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span className="break-all">info@colourclouds.ng</span>
                  </a>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-sm text-gray-500">
                  Available 24/7 for your digital needs
                </p>
              </div>
            </div>

            {/* Newsletter Section */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Subscribe to our newsletter for the latest updates, tips, and exclusive content.
              </p>
              <NewsletterForm source="/footer" variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} Colour Clouds Digital. All rights reserved.
            </p>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link 
                href="/quality-policy"
                className="text-gray-500 hover:text-cc-green transition-colors duration-200"
              >
                Quality Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-500 hover:text-cc-green transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                href="/sitemap.xml" 
                className="text-gray-500 hover:text-cc-green transition-colors duration-200"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-cc-green via-cc-blue to-cc-green" />
    </footer>
  )
}

export default MainFooter
