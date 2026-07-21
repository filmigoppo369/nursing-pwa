import type { Metadata, Viewport } from "next";
import "./globals.css";

// ✅ 1. ADD THIS VIEWPORT CONFIGURATION
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents accidental zooming on mobile
};

export const metadata: Metadata = {
  title: "MONTASTIC",
  description: "BY NURSE, FOR NURSE, OF NURSE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}