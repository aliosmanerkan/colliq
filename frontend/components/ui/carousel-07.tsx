// --- Component ---
"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
}

export const defaultSlides: Slide[] = [
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/y2kdGGCbDJ-NiVlzp3LSadGxj4XCboszXVPLX_qSppQ",
    title: "Shiny Charizard EX",
    description: "2023 Japanese Sv4a Shiny Treasure #115 • PSA 10 GEM MINT",
    badge: "Pokémon • PSA 10",
  },
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/OghlNflf_driynJhar7OriMwhdklrbhSJ0jCcx37VS0",
    title: "Lionel Messi",
    description: "2018 Panini Prizm World Cup #1 • PSA 10 GEM MINT",
    badge: "Soccer • PSA 10",
  },
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/h2TbkM8kMZn_rCaZDVTtEovdT0Dl0SBs_GxIo5_VYYU",
    title: "Ace, Sabo & Luffy",
    description: "2025 Carrying on His Will OP13 #007 • PSA 10 GEM MINT",
    badge: "One Piece • PSA 10",
  },
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/xXIXkS_I7Ws9c1FUK1eXeHwtqo19CHiYWyficpuKxPM",
    title: "LeBron James",
    description: "2003 Upper Deck Lebron James Box Set #7 • PSA 9 MINT",
    badge: "Basketball • PSA 9",
  },
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/3suOU9-QTl-rr72CPtgjES0BaebTlZTquCwFdI4T0B8",
    title: "Shohei Ohtani",
    description: "2025 Topps Heritage Collection #1 • PSA 10 GEM MINT",
    badge: "Baseball • PSA 10",
  },
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/XKIa4U_d0cTx88rG_cDbJMX14_HDNosqWFRl0pgExyM",
    title: "Son Goku Super",
    description: "2025 Fusion World New Adventure #FB05 • PSA 10 GEM MINT",
    badge: "Dragon Ball • PSA 10",
  },
  {
    image: "https://d1xpxki1g4htqu.cloudfront.net/Ny9guETP_-HyjrZu3dMU7DPIf_vnReQys3TOnIwMcr0",
    title: "Mega Charizard X",
    description: "2025 Japanese M2-Inferno X #013 • PSA 10 GEM MINT",
    badge: "Pokémon • PSA 10",
  },
];

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 500,
      sensitivity: 180,
      xMultiplier: 80,
      yMultiplier: 16,
      rotationMultiplier: 6,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 650,
      sensitivity: 220,
      xMultiplier: 120,
      yMultiplier: 24,
      rotationMultiplier: 8,
      scaleReduction: 0.08,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 800,
    sensitivity: 250,
    xMultiplier: 155,
    yMultiplier: 28,
    rotationMultiplier: 10,
    scaleReduction: 0.1,
  };
};

export interface CarouselStackedProps {
  slides?: Slide[];
  className?: string;
}

const CarouselStacked = ({
  slides = defaultSlides,
  className,
}: CarouselStackedProps) => {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const [windowWidth, setWindowWidth] = React.useState(0);

  const total = slides.length;

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const handleDragStart = () => {
    startProgress.current = scrollProgress.get();
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    totalShift = Math.max(-3, Math.min(3, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 200,
      damping: 30,
      mass: 1,
    });
  };

  return (
    <div className={cn("flex flex-col items-center justify-center w-full py-6 select-none", className)}>
      <div className="relative w-full max-w-7xl h-[380px] sm:h-[480px] lg:h-[540px] flex items-center justify-center">
        {/* Transparent Drag Surface */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={(_, info) => {
            const delta = -info.delta.x / config.sensitivity;
            scrollProgress.set(scrollProgress.get() + delta);
          }}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        />

        {slides.map((slide, i) => (
          <Card
            key={i}
            slide={slide}
            index={i}
            total={total}
            progress={scrollProgress}
            config={config}
          />
        ))}
      </div>
    </div>
  );
};

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const Card = ({ slide, index, total, progress, config }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return absO * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );

  return (
    <motion.div
      style={{
        x,
        rotate,
        y,
        scale,
        opacity,
        zIndex,
      }}
      className={cn(
        "absolute rounded-[22px] overflow-hidden bg-[#0c0d12] group pointer-events-none shadow-[0_16px_36px_rgba(0,0,0,0.35)] border border-white/20",
        "w-[180px] h-[300px] sm:w-[234px] sm:h-[390px] lg:w-[264px] lg:h-[440px]",
      )}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-contain bg-[#0a0b10] pointer-events-none transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

      <Badge className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-wider text-black shadow-md border-0 pointer-events-none">
        {slide.badge}
      </Badge>

      <div className="absolute bottom-4 left-3 right-3 sm:bottom-5 sm:left-4 sm:right-4 text-white text-center sm:text-left pointer-events-none">
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="font-display text-base sm:text-lg lg:text-xl uppercase tracking-wide leading-tight mb-0.5 drop-shadow-md text-white"
        >
          {slide.title}
        </motion.p>
        <motion.p
          style={{
            opacity: useTransform(offset, [-0.5, 0, 0.5], [0, 1, 0]),
          }}
          className="hidden sm:block text-[11px] text-white/80 line-clamp-1 font-medium font-sans"
        >
          {slide.description}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default CarouselStacked;
