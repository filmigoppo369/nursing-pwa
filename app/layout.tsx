import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NursePrep MCQs",
  description: "Ace your nursing exams with practice questions",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}