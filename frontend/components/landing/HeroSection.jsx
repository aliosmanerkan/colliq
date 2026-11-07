"use client";

import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const scrollToCollections = () => {
    const el = document.getElementById("hot-collections");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full bg-[#a8f0be] pt-8 sm:pt-14 pb-20 sm:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[460px] sm:min-h-[520px]">
          
          {/* Left: Huge Display Typography */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[5.4rem] xl:text-[6.2rem] text-[#053b2a] leading-[0.93] tracking-tight uppercase select-none">
              THE FUTURE<br />
              OF COLLECTING<br />
              IS AGENTIC.
            </h1>
          </div>

          {/* Right: Layered 3D Perspective Card Stack */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[330px] lg:w-[360px] aspect-[4/5] flex items-center justify-center">
              
              {/* Back Layer 1 (Tilted Right) */}
              <div className="absolute inset-0 rounded-[28px] bg-emerald-800/20 transform rotate-6 translate-x-3 translate-y-2 border border-white/20 shadow-lg pointer-events-none" />

              {/* Back Layer 2 (Tilted Left) */}
              <div className="absolute inset-0 rounded-[28px] bg-emerald-900/30 transform -rotate-3 -translate-x-2 translate-y-1 border border-white/30 shadow-xl pointer-events-none" />

              {/* Front Main Scenic Card (Alpine Lake with Wooden Boat from Figma) */}
              <div className="relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl shadow-[#043021]/30 border-2 border-white/50 group transition-transform duration-500 hover:scale-[1.02]">
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop" 
                  alt="Scenic Alpine Collectible" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                
                {/* Subtle Top Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[11px] font-semibold text-[#043224] tracking-wide uppercase shadow-sm">
                  Alpine Gem-MT 10
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Center: See Collections Prompt */}
        <div className="flex flex-col items-center justify-center mt-12 sm:mt-16 text-[#043224]">
          <button 
            onClick={scrollToCollections}
            className="group flex flex-col items-center gap-1.5 text-xs font-medium cursor-pointer transition hover:opacity-80"
          >
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform" />
            <span>See collections</span>
          </button>
        </div>

      </div>
    </section>
  );
}
