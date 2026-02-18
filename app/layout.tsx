import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BACKLOT — Onchain Reality Docu-Series",
  description:
    "An onchain reality docu-series using a meme token + community to fund and document ambitious creative projects in public. Starting with The Complex in Jamaica.",
  openGraph: {
    title: "BACKLOT — Onchain Reality Docu-Series",
    description: "A social experiment testing how far community can take creative ideas IRL.",
    images: ["/brand/banner.jpeg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-backlot-bg font-sans text-backlot-text antialiased">
        <WalletProvider>
          <AppShell>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </AppShell>
        </WalletProvider>
      </body>
    </html>
  );
}
