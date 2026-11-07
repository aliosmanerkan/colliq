"use client";

import Link from "next/link";

export default function HotCollections() {
  return (
    <section id="hot-collections" className="w-full bg-[#fbfdfb] py-24 sm:py-32 overflow-hidden border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        
        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-[#053b2a] text-center mb-16 tracking-wide uppercase">
          HOT COLLECTIONS
        </h2>

        {/* Fanned 5-Card Spread Arc Container */}
        <div className="relative max-w-5xl mx-auto h-[460px] sm:h-[500px] flex items-center justify-center">
          
          {/* Card 1: NATURE (Left-most) */}
          <Link
            href="/marketplace"
            className="absolute left-[3%] sm:left-[8%] top-[14%] w-[160px] sm:w-[210px] aspect-[3/4.2] rounded-[24px] overflow-hidden shadow-xl hover:shadow-2xl hover:scale-110 hover:z-30 hover:-translate-y-3 transition-all duration-300 transform -rotate-[14deg] cursor-pointer group border border-black/5"
          >
            <img 
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop" 
              alt="Nature" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-neutral-800 tracking-wider uppercase shadow-sm">
              NATURE
            </div>
          </Link>

          {/* Card 2: PARADISE (Mid-Left) */}
          <Link
            href="/marketplace"
            className="absolute left-[20%] sm:left-[24%] top-[7%] w-[170px] sm:w-[225px] aspect-[3/4.2] rounded-[24px] overflow-hidden shadow-xl hover:shadow-2xl hover:scale-110 hover:z-30 hover:-translate-y-3 transition-all duration-300 transform -rotate-[7deg] cursor-pointer group border border-black/5"
          >
            <img 
              src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=800&auto=format&fit=crop" 
              alt="Paradise" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-neutral-800 tracking-wider uppercase shadow-sm">
              PARADISE
            </div>
          </Link>

          {/* Card 3: SERENITY (Centerpiece - Spiritual Path Buddha) */}
          <Link
            href="/marketplace"
            className="relative z-20 w-[190px] sm:w-[250px] aspect-[3/4.2] rounded-[26px] overflow-hidden shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-white/60"
          >
            <img 
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop" 
              alt="Serenity" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-neutral-900 tracking-wider uppercase shadow-md">
              SERENITY
            </div>

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h4 className="font-semibold text-base sm:text-lg tracking-tight">
                Spiritual Path
              </h4>
              <p className="text-[11px] text-white/80 mt-0.5 leading-snug">
                Discover inner peace through ancient wisdom.
              </p>
            </div>
          </Link>

          {/* Card 4: ADVENTURE (Mid-Right) */}
          <Link
            href="/marketplace"
            className="absolute right-[20%] sm:right-[24%] top-[7%] w-[170px] sm:w-[225px] aspect-[3/4.2] rounded-[24px] overflow-hidden shadow-xl hover:shadow-2xl hover:scale-110 hover:z-30 hover:-translate-y-3 transition-all duration-300 transform rotate-[7deg] cursor-pointer group border border-black/5"
          >
            <img 
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop" 
              alt="Adventure" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-neutral-800 tracking-wider uppercase shadow-sm">
              ADVENTURE
            </div>
          </Link>

          {/* Card 5: EXTREME (Right-most) */}
          <Link
            href="/marketplace"
            className="absolute right-[3%] sm:right-[8%] top-[14%] w-[160px] sm:w-[210px] aspect-[3/4.2] rounded-[24px] overflow-hidden shadow-xl hover:shadow-2xl hover:scale-110 hover:z-30 hover:-translate-y-3 transition-all duration-300 transform rotate-[14deg] cursor-pointer group border border-black/5"
          >
            <img 
              src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop" 
              alt="Extreme" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-neutral-800 tracking-wider uppercase shadow-sm">
              EXTREME
            </div>
          </Link>

        </div>

        {/* Quick link into card catalog */}
        <div className="text-center mt-12">
          <Link
            href="/marketplace"
            className="text-xs font-semibold text-[#053b2a] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore live Collector Crypt cards in Marketplace</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
