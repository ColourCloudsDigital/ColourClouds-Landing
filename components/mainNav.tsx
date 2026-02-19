"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import CcLogo from '../app/cc-logo.svg';
import { ThemeToggle } from "./theme-toggle";

/**
 * Modern Main Navigation Component
 * 
 * Features:
 * - Fixed navigation with backdrop blur
 * - Smooth scroll behavior with show/hide on scroll
 * - Active link highlighting
 * - Mobile-responsive hamburger menu with slide-in drawer
 * - Dark mode toggle
 * - Smooth animations and transitions
 * 
 * Requirements: 1.7, 1.9
 */

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  const menus = [
    { title: "Home", path: "/" },
    { title: "Services", path: "/services" },
    { title: "About", path: "/about" },
    { title: "Blog", path: "/blog" },
    { title: "Contact", path: "/contact" },
  ];

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md' 
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Back to homepage"
              className="flex items-center gap-3 transition-transform hover:scale-105 duration-300"
            >
              <CcLogo className="w-[120px] h-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {menus.map((item, idx) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={idx}
                    href={item.path}
                    className={`px-4 py-2 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-cc-green bg-cc-green/10'
                        : 'text-gray-700 dark:text-gray-300 hover:text-cc-green hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
              
              {/* Theme Toggle */}
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-gray-900 z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <Link
              href="/"
              aria-label="Back to homepage"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CcLogo className="w-[100px] h-auto" />
            </Link>
            <button
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Menu Links */}
          <nav className="flex-1 overflow-y-auto py-6">
            <ul className="space-y-2 px-4">
              {menus.map((item, idx) => {
                const isActive = pathname === item.path;
                return (
                  <li key={idx}>
                    <Link
                      href={item.path}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-cc-green bg-cc-green/10'
                          : 'text-gray-700 dark:text-gray-300 hover:text-cc-green hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              © {new Date().getFullYear()} Colour Clouds Digital
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
