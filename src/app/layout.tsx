import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaliber Kitchen",
  description: "Cooking with Precision. Use what you have, waste less, and cook smarter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
