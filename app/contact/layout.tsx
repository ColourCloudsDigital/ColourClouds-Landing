import type { Metadata } from "next";

/**
 * Contact Page Layout
 * 
 * This layout provides metadata for the contact page since the page itself
 * is a client component and cannot export metadata directly.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.7
 */

export const metadata: Metadata = {
  title: 'Contact Us | Colour Clouds Digital',
  description: 'Get in touch with Colour Clouds Digital. Send us a message about your project or inquiry. We offer app development and digital content creation services.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Colour Clouds Digital',
    description: 'Get in touch with Colour Clouds Digital. Send us a message about your project or inquiry.',
    type: 'website',
    url: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
