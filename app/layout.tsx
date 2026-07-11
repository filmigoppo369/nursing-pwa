import type { Metadata } from "next";
import "./globals.css";

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