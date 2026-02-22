import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "AI Auto Teaching Hub",
  description: "Guided AI tool practice with step verification"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jakarta.className}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

