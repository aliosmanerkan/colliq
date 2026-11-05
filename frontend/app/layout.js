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
  title: "VaultDeck • Autonomous Merchant Vaults Protocol",
  description: "Autonomous Merchant Vault NFTs trading physical-backed Pokémon slabs on NEAR Protocol",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
