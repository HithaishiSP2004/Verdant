import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VERDANT — Track. Understand. Reduce. Your Carbon Footprint.",
  description: "VERDANT uses AI to analyze your daily habits, build your personal carbon identity, and simulate your 5-year environmental future. Track, understand, and reduce your carbon footprint through simple, personalized actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
