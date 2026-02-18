import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BACKLOT — Onchain Reality Docu-Series",
  description: "An onchain reality docu-series using a meme token + community to fund and document ambitious creative projects in public.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-backlot-bg font-sans text-backlot-text antialiased">
        {children}
      </body>
    </html>
  );
}
