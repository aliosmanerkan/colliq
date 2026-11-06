import { Geist, Geist_Mono } from "next/font/google";
import "./wallet-selector.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "VaultDeck • Autonomous Merchant Vaults Protocol | NEAR Track 10",
  description: "Autonomous Merchant Vault NFTs trading physical-backed Pokémon PSA slabs on NEAR Protocol via A2A Swarm Barter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100 font-sans selection:bg-cyan-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
