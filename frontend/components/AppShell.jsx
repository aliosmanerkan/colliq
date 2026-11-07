"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] flex flex-col justify-between selection:bg-white selection:text-black font-sans antialiased">
      {/* Frame 1.png Navbar - Active on ALL Layouts */}
      <Navbar />

      {isLandingPage ? (
        <div className="w-full flex-1">
          {children}
        </div>
      ) : (
        <>
          {/* Apple Studio Ambient Spotlight */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_70%)]" />
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
            {children}
          </main>

          {/* Apple Footer for Internal App */}
          <footer className="border-t border-neutral-900 bg-black py-10 text-xs text-neutral-500 font-sans mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 font-medium">VaultDeck Protocol</span>
                <span>•</span>
                <span>NEAR Hackathon Track 10 Submission</span>
              </div>

              <div className="flex items-center gap-4 text-neutral-500">
                <span>NEP-171 & NEP-177 Dynamic Accounts</span>
                <span>•</span>
                <span className="text-neutral-400">Brink's Sealed Custody</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
