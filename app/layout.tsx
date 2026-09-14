import type { Metadata } from "next";
import { fontClassNames } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Landing page generator",
  description: "Describe a business, get a landing page.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassNames}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
