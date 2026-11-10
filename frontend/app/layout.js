import { Poppins, Squada_One, Geist_Mono } from "next/font/google";
import "./wallet-selector.css";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AppShell from "@/components/AppShell";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const squadaOne = Squada_One({
  variable: "--font-squada-one",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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
    <html lang="en" className={`${poppins.variable} ${squadaOne.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100 font-sans selection:bg-emerald-400 selection:text-slate-950">
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
