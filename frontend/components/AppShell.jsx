"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="min-h-screen bg-[#f8faf9] text-neutral-900 flex flex-col justify-between selection:bg-[#073525] selection:text-white font-sans antialiased">
      {/* Frame 1.png Navbar - Active on ALL Layouts */}
      <Navbar />

      {isLandingPage ? (
        <div className="w-full flex-1">
          {children}
        </div>
      ) : (
        <>
          {/* Subtle Ambient Mint Glow */}
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(168,240,190,0.35)_0%,rgba(248,250,249,0)_70%)]" />
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
            {children}
          </main>

          {/* Clean Light Footer for App Pages */}
          <footer className="border-t border-neutral-200/80 bg-white py-10 text-xs text-neutral-500 font-sans mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#053b2a] font-semibold">Colliq Protocol</span>
                <span>•</span>
                <span>NEAR Hackathon Track 10 Submission</span>
              </div>

              <div className="flex items-center gap-4 text-neutral-500">
                <span>NEP-171 & NEP-177 Dynamic Accounts</span>
                <span>•</span>
                <span className="text-neutral-700 font-medium">Brink's Sealed Custody</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
