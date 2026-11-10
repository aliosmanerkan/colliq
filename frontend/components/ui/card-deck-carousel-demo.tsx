"use client";

import CardDeckCarousel from "@/components/ui/card-deck-carousel";

const DEMO_CARDS = [
  {
    title: "Mega Charizard X EX",
    caption: "2025 Japanese M2-Inferno X • PSA 10 GEM MINT",
    category: "POKÉMON",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/Ny9guETP_-HyjrZu3dMU7DPIf_vnReQys3TOnIwMcr0",
  },
  {
    title: "Lionel Messi World Cup",
    caption: "2018 Panini Prizm World Cup • PSA 10 GEM MINT",
    category: "SOCCER",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/OghlNflf_driynJhar7OriMwhdklrbhSJ0jCcx37VS0",
  },
  {
    title: "Perona Limited Art",
    caption: "2025 One Piece Japanese Vol.1 • PSA 10 GEM MINT",
    category: "ONE PIECE",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/EA6_s7NeAzIEbxXUs_CYinNWLrfe8Tdbf_-PMOfnvCM",
  },
  {
    title: "LeBron James Rookie",
    caption: "2003 Upper Deck Lebron James #7 • PSA 9 MINT",
    category: "BASKETBALL",
    grade: "PSA 9",
    image: "https://d1xpxki1g4htqu.cloudfront.net/xXIXkS_I7Ws9c1FUK1eXeHwtqo19CHiYWyficpuKxPM",
  },
  {
    title: "Shohei Ohtani #1",
    caption: "2025 Topps Heritage Collection • PSA 10 GEM MINT",
    category: "BASEBALL",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/3suOU9-QTl-rr72CPtgjES0BaebTlZTquCwFdI4T0B8",
  },
  {
    title: "Son Goku Fusion World",
    caption: "2025 Super Card Game New Adventure • PSA 10",
    category: "DRAGON BALL",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/XKIa4U_d0cTx88rG_cDbJMX14_HDNosqWFRl0pgExyM",
  },
  {
    title: "Yasuo Unforgiven",
    caption: "2025 League of Legends OGN Origins • PSA 10",
    category: "RIFTBOUND",
    grade: "PSA 10",
    image: "https://d1xpxki1g4htqu.cloudfront.net/z9FJZSdXJMpRjRkfdDe-svmRbk0LpE9GcQjHd8oSLaw",
  },
];

export default function CardDeckCarouselDemo() {
  return (
    <div className="p-8 flex items-center justify-center bg-[#a8f0be] min-h-screen">
      <div className="w-full max-w-[360px]">
        <CardDeckCarousel
          slides={DEMO_CARDS}
          aspect="3.1 / 4.3"
          scatter={8}
          autoplay={3200}
          showButtons={false}
          showCount={true}
          background="transparent"
          ink="#043224"
        />
      </div>
    </div>
  );
}
