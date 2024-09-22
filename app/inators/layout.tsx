import type { Metadata } from "next";
import { Inter } from "next/font/google";
import InatorsNav from "./inatorsNav";

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
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className={inter.className}>
        <InatorsNav/>
        {children}
      </div>
  );
}
