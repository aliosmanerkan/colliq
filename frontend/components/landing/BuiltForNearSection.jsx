"use client";

export default function BuiltForNearSection() {
  return (
    <section className="w-full bg-[#0d0e12] py-24 sm:py-32 text-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#a8f0be] tracking-tight uppercase">
            NOT JUST ON NEAR. BUILT FOR NEAR.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-relaxed">
            VaultDeck brings autonomous NFT collectors to life with NEAR accounts, secure trading, and cross-chain capabilities.
          </p>
        </div>

        {/* Dark Cards Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl mx-auto">
          
          {/* Card 1: Search by meaning (7 Cols) */}
          <div className="lg:col-span-7 bg-[#131419] border border-white/[0.08] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative min-h-[360px]">
            
            {/* Matrix Dot Grid Graphic */}
            <div className="relative w-full h-48 rounded-xl bg-black/40 border border-white/[0.05] overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full opacity-70" viewBox="0 0 400 180">
                <defs>
                  <radialGradient id="cyanGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="dotPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="#22d3ee" fillOpacity="0.25" />
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect width="100%" height="100%" fill="url(#dotPattern)" />
                
                {/* Glowing Clusters */}
                <circle cx="100" cy="110" r="38" fill="url(#cyanGlow)" />
                <circle cx="220" cy="60" r="42" fill="url(#cyanGlow)" />
                <circle cx="230" cy="130" r="32" fill="url(#cyanGlow)" />

                {/* Targeting Rings & Crosshairs */}
                <circle cx="100" cy="110" r="18" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="100" cy="110" r="8" fill="#22d3ee" fillOpacity="0.6" />
                <line x1="20" y1="150" x2="100" y2="110" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                
                <circle cx="220" cy="60" r="14" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                <circle cx="230" cy="130" r="10" fill="none" stroke="#2dd4bf" strokeWidth="1" />
              </svg>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight">
                Search by meaning
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                Find the closest matches across millions of embeddings in a few milliseconds.
              </p>
            </div>
          </div>

          {/* Card 2: Answers from cache (5 Cols) */}
          <div className="lg:col-span-5 bg-[#131419] border border-white/[0.08] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[360px]">
            
            {/* Radar Fingerprint Graphic */}
            <div className="relative w-full h-48 rounded-xl bg-black/40 border border-white/[0.05] overflow-hidden flex items-center justify-center">
              <div className="relative flex items-center justify-center gap-4">
                {/* Small preview frame 1 */}
                <div className="w-8 h-8 rounded border border-cyan-400/40 bg-cyan-950/40 flex items-center justify-center text-[8px] font-mono text-cyan-300">
                  RAM
                </div>

                {/* Small preview frame 2 */}
                <div className="w-12 h-14 rounded-md border border-cyan-400/60 bg-cyan-950/60 flex items-center justify-center text-[10px] font-mono text-cyan-200">
                  HASH
                </div>

                {/* Big target circle */}
                <div className="relative w-24 h-24 rounded-full border border-cyan-400/80 bg-cyan-500/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-cyan-400/50 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight">
                Answers from cache
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 leading-relaxed">
                Repeat requests come straight from memory, so the database only sees what is new.
              </p>
            </div>
          </div>

          {/* Card 3: Fair limits for every key (12 Cols) */}
          <div className="lg:col-span-12 bg-[#131419] border border-white/[0.08] rounded-[24px] p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Waveform Amplitude Chart (7 Cols) */}
            <div className="lg:col-span-7 h-44 rounded-xl bg-black/40 border border-white/[0.05] p-4 flex flex-col justify-end relative overflow-hidden">
              
              {/* Horizontal Threshold Line */}
              <div className="absolute top-[38%] left-0 right-0 h-[1px] bg-cyan-400/40 z-10 flex items-center justify-between px-3">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  100/S LIMIT
                </span>
                <div className="flex gap-4">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                    429 REFUSED
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                    429 REFUSED
                  </span>
                </div>
              </div>

              {/* Digital Bars Graphic */}
              <div className="flex items-end justify-between h-28 gap-1 pt-4">
                {[20, 25, 45, 60, 30, 75, 95, 100, 85, 40, 25, 30, 50, 80, 100, 90, 60, 35, 20, 45, 65, 85, 40, 30, 20].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-cyan-400/70 hover:bg-cyan-300 rounded-t-sm transition-all"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

            </div>

            {/* Right Description (5 Cols) */}
            <div className="lg:col-span-5">
              <h3 className="font-semibold text-base sm:text-lg text-white tracking-tight">
                Fair limits for every key
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                Each key gets its own budget, and bursts are smoothed out before they reach your service.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
