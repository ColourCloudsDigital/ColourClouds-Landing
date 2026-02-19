import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/mainNav";
import MainFooter from "@/components/mainFooter";
import { NewsletterPopup } from "@/components/newsletter-popup";
import { ThemeProvider } from "@/components/theme-provider";
import { ReCaptchaProvider } from "@/components/recaptcha-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colour Clouds Digital",
  description:
    "Jump into the digital world with Colour Clouds",
  keywords: [
    "Digital creators",
    "App development",
    "Content creation",
  ],
  verification: {
    google: "wuKkVFD1dhs31EjQNk81yBbw-temshhMPPc8JGAUC94",
  },
  other: {
    "google-adsense-account": "ca-pub-9924264215171914",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9924264215171914"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light" storageKey="colour-clouds-theme">
          <ReCaptchaProvider>
            <div className="">
              <MainNav />
            </div>

            <div className="min-h-screen mt-16">{children}</div>

            <div>
              <MainFooter />
            </div>
            <Toaster />
            <NewsletterPopup />
          </ReCaptchaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
