import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGS Workspace",
  description: "Aluminium Glass Solutions – Central Workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#1a1c1e] text-gray-100">{children}</body>
    </html>
  );
}
