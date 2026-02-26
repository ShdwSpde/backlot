import type { Metadata } from "next";
import "./globals.css";
import WalletProvider from "@/components/providers/WalletProvider";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "BACKLOT — Onchain Reality Docu-Series",
  description:
    "An on-chain reality docu-series using a meme token + community to fund and document ambitious founders and projects from the Caribbean and beyond in public.",
  metadataBase: new URL("https://www.backlotsocial.xyz"),
  openGraph: {
    title: "BACKLOT — Onchain Reality Docu-Series",
    description: "A social experiment testing how far community can take big ideas IRL. Hold $BACKLOT to vote, fund milestones, and shape the story.",
    images: [{ url: "/brand/banner.jpeg", width: 1500, height: 500, alt: "BACKLOT — Reality TV. On Chain. For Good." }],
    type: "website",
    siteName: "BACKLOT",
    url: "https://www.backlotsocial.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "BACKLOT — Reality TV. On Chain. For Good.",
    description: "An on-chain reality docu-series from Jamaica. Hold $BACKLOT to vote, fund milestones, and shape the story.",
    images: ["/brand/banner.jpeg"],
    creator: "@Backlot876",
    site: "@Backlot876",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#B8A9D4" />
      </head>
      <body className="min-h-screen bg-backlot-bg font-sans text-backlot-text antialiased">
        <WalletProvider>
          <AppShell>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </AppShell>
        </WalletProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
