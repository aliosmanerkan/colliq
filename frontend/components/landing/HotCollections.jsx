"use client";

import CarouselStacked from "@/components/ui/carousel-07";

export default function HotCollections() {
  return (
    <section 
      id="hot-collections" 
      className="w-full py-16 sm:py-24 border-b border-neutral-200/60 overflow-hidden relative"
      style={{
        background: "radial-gradient(50% 50% at 50% 100%, var(--sar, #D0E08C) 0%, #F7F7F7 100%)"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8 sm:mb-12">

          <h2 className="font-squada  text-3xl sm:text-4xl lg:text-5xl text-[#053b2a] tracking-wider uppercase mt-1">
            HOT COLLECTIONS
          </h2>
        </div>

        {/* Interactive Stacked Motion Carousel */}
        <div className="w-full">
          <CarouselStacked />
        </div>

      </div>
    </section>
  );
}
