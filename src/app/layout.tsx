import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Auto Teaching Hub",
  description: "Guided AI tool practice with step verification"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={outfit.className}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

