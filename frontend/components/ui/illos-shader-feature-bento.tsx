"use client";

// Three-card feature bento for AI and data products.
// The illustration is three Shader illustrations: Vector search, Cache layer and Rate limiting from Illos (https://illos.dev).
// It loops while it is on screen, pauses off screen, and stays still for prefers-reduced-motion.
//
// License
// The component code in this file (layout, props, play logic) is free to use, change and share under the MIT license.
// The illustration inside it (the SVG markup and its animation) is not covered by MIT. It belongs to Illos and is
// licensed under the Illos free license, https://illos.dev/license: you can use it in personal and commercial work,
// including client projects, with no credit needed, and you may modify it. Not allowed: redistributing or selling it
// as an asset (packs, illustration or icon sites, or other libraries), or using it to build a competing illustration
// library.
import { useEffect, useRef, type CSSProperties } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export type ShaderIllustration = "vector-search" | "cache-layer" | "rate-limit";

export type IllosShaderFeatureBentoProps = {
  eyebrow?: string;
  title?: string;
  items?: { title: string; description: string; illustration: ShaderIllustration }[];
  className?: string;
};

const DEFAULT_ITEMS: NonNullable<IllosShaderFeatureBentoProps["items"]> = [
  { 
    title: "Collect Across Chains", 
    description: "NEAR Chain Signatures and MPC let collectors access and trade assets on other networks, including Solana.", 
    illustration: "vector-search" 
  },
  { 
    title: "NFTs as Accounts", 
    description: "Each NEP-171 Collector NFT has its own NEAR sub-account, USDC vault, and evolving on-chain identity.", 
    illustration: "cache-layer" 
  },
  { 
    title: "Secure Agent-to-Agent Trading", 
    description: "AI collectors negotiate multi-card and USDC swaps. NEAR smart contracts enforce trading limits and handle settlement.", 
    illustration: "rate-limit" 
  },
];

export function IllosShaderFeatureBento({
  eyebrow = "Built on NEAR",
  title = "Autonomous Infrastructure for Physical RWA Trading",
  items = DEFAULT_ITEMS,
  className,
}: IllosShaderFeatureBentoProps) {
  return (
    <section className={cx("w-full bg-background", className)}>
      <div className="mx-auto font-poppins flex max-w-6xl flex-col gap-10 px-6 py-16 sm:py-20">
        <div className="flex max-w-2xl flex-col gap-3">
          <span className="text-sm font-poppins font-medium text-muted-foreground">{eyebrow}</span>
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">{title}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={item.title}
              className={cx(
                "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
                i === 0 && "md:col-span-2",
                i === 2 && "md:col-span-3 md:flex-row md:items-center",
              )}
            >
              <div
                className={cx(
                  "flex flex-1 items-center border-b border-border",
                  i === 2 && "md:w-1/2 md:flex-none md:self-stretch md:border-b-0 md:border-r",
                )}
              >
                <ShaderArt
                  name={item.illustration}
                  className="w-full [--illos-ground:var(--color-card)] [--illos-ink:var(--color-card-foreground)]"
                />
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h3 className="text-base font-semibold text-card-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default IllosShaderFeatureBento;

const SHADER_SVGS: Record<ShaderIllustration, string> = {
  "vector-search": `<svg class="sh-vector-search" xmlns="http://www.w3.org/2000/svg" width="720" height="460" viewBox="0 0 720 460" fill="none" role="img" aria-labelledby="sh-vector-search-t">
<title id="sh-vector-search-t">Collect Across Chains</title>
<style>@scope (svg.sh-vector-search) {
:scope{--_ground:#ffffff;--_ink:#2a2a2a;--_ramp-1:#073525;--_ramp-2:#10b981;--_ramp-3:#34d399;--_ramp-4:#a7f3d0;--_mark:#059669;--_spark:#047857}
:scope:is(.dark *){--_ground:#101112;--_ink:#dadadc;--_ramp-1:#6ee7b7;--_ramp-2:#10b981;--_ramp-3:#059669;--_ramp-4:#064e3b;--_mark:#10b981;--_spark:#ffffff}
:scope{--g:var(--illos-ground,var(--_ground));--k:var(--illos-ink,var(--_ink))}
.b0,.b1,.b2,.b3{fill:none;stroke-dasharray:7 2.4}
.b0{stroke:var(--illos-ramp-1,var(--_ramp-1))}.b1{stroke:var(--illos-ramp-2,var(--_ramp-2))}.b2{stroke:var(--illos-ramp-3,var(--_ramp-3))}.b3{stroke:var(--illos-ramp-4,var(--_ramp-4));opacity:.55}
.sc{fill:none;stroke:color-mix(in srgb,var(--illos-ramp-4,var(--_ramp-4)) 18%,var(--g));stroke-width:.8}
.bm{fill:none;stroke:var(--illos-ramp-2,var(--_ramp-2));stroke-width:2.4;stroke-dasharray:5 2.4}
.sp{fill:none;stroke:var(--illos-spark,var(--_spark));stroke-width:1.2;stroke-linecap:round;opacity:.85}
.gr{stroke:color-mix(in srgb,var(--k) 9%,var(--g));stroke-width:1}
.bx,.ln,.lv{fill:none;stroke:var(--illos-mark,var(--_mark));stroke-width:1.2}
.dot{fill:var(--illos-mark,var(--_mark))}.cf{fill:var(--illos-mark,var(--_mark))}
.ct{fill:none;stroke:var(--g);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round}
@keyframes sh-vector-search_m{0%{opacity:1}7.143%{opacity:1}14.286%{opacity:0}70.238%{opacity:0}77.381%{opacity:1}100%{opacity:1}}
.m{opacity:1;animation:sh-vector-search_m 4.2s linear both}
@keyframes sh-vector-search_clock{0%{opacity:0}100%{opacity:0}}
.sh-clock{animation:sh-vector-search_clock 4.2s linear both}
*{animation-iteration-count:1!important;animation-fill-mode:both!important;animation-play-state:var(--illos-play,running)!important}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
}
</style>
<g class="sh-still"><path class="sc" d="M4 0V460M11 0V460M18 0V460M25 0V460M32 0V460M39 0V460M46 0V460M53 0V460M60 0V460M67 0V460M74 0V460M81 0V460M88 0V460M95 0V460M102 0V460M109 0V460M116 0V460M123 0V460M130 0V460M137 0V460M144 0V460M151 0V460M158 0V460M165 0V460M172 0V460M179 0V460M186 0V460M193 0V460M200 0V460M207 0V460M214 0V460M221 0V460M228 0V460M235 0V460M242 0V460M249 0V460M256 0V460M263 0V460M270 0V460M277 0V460M284 0V460M291 0V460M298 0V460M305 0V460M312 0V460M319 0V460M326 0V460M333 0V460M340 0V460M347 0V460M354 0V460M361 0V460M368 0V460M375 0V460M382 0V460M389 0V460M396 0V460M403 0V460M410 0V460M417 0V460M424 0V460M431 0V460M438 0V460M445 0V460M452 0V460M459 0V460M466 0V460M473 0V460M480 0V460M487 0V460M494 0V460M501 0V460M508 0V460M515 0V460M522 0V460M529 0V460M536 0V460M543 0V460M550 0V460M557 0V460M564 0V460M571 0V460M578 0V460M585 0V460M592 0V460M599 0V460M606 0V460M613 0V460M620 0V460M627 0V460M634 0V460M641 0V460M648 0V460M655 0V460M662 0V460M669 0V460M676 0V460M683 0V460M690 0V460M697 0V460M704 0V460M711 0V460M718 0V460"/><path class="gr" d="M0 0V460M96 0V460M192 0V460M288 0V460M384 0V460M480 0V460M576 0V460M672 0V460M0 0H720M0 96H720M0 192H720M0 288H720M0 384H720"/><path class="b0" d="M200 216.2V223.2M207 216.2V232.6M214 206.8V232.6M221 216.2V232.6M228 225.6V232.6M277 206.8V213.8M277 225.6V232.6M284 206.8V232.6M291 188V251.4M298 188V251.4M305 197.4V260.8M312 188V260.8M319 188V260.8M326 178.6V260.8M333 188V260.8M340 197.4V260.8M347 188V195M347 206.8V232.6M347 244.4V260.8M354 206.8V213.8M354 225.6V232.6M571 338.4V345.4M578 319.6V345.4M585 329V336M585 347.8V354.8M592 319.6V336" stroke-width="3.6"/><path class="b1" d="M193 216.2V232.6M200 206.8V213.8M200 225.6V242M207 206.8V213.8M214 235V242M221 206.8V213.8M221 235V242M228 206.8V223.2M228 235V242M235 206.8V232.6M256 206.8V213.8M263 206.8V223.2M270 188V242M277 178.6V204.4M277 216.2V223.2M277 235V260.8M284 178.6V204.4M284 235V270.2M291 178.6V185.6M291 253.8V270.2M298 178.6V185.6M298 253.8V270.2M305 159.8V195M305 263.2V279.6M312 159.8V185.6M312 263.2V279.6M319 169.2V185.6M319 263.2V279.6M326 169.2V176.2M326 263.2V270.2M333 178.6V185.6M333 263.2V270.2M340 169.2V195M340 263.2V270.2M347 178.6V185.6M347 197.4V204.4M347 235V242M347 263.2V270.2M354 178.6V204.4M354 216.2V223.2M354 235V270.2M361 197.4V251.4M368 188V204.4M368 216.2V251.4M375 216.2V242M536 94V101M536 122.2V129.2M543 94V101M543 112.8V119.8M543 131.6V138.6M543 329V336M550 94V101M550 112.8V119.8M550 131.6V138.6M550 310.2V317.2M550 329V354.8M557 122.2V129.2M557 310.2V364.2M564 131.6V138.6M564 300.8V354.8M564 366.6V373.6M571 291.4V298.4M571 310.2V336M571 347.8V383M578 291.4V298.4M578 310.2V317.2M578 347.8V383M585 291.4V326.6M585 338.4V345.4M585 357.2V383M592 291.4V317.2M592 338.4V373.6M599 300.8V373.6M606 300.8V373.6M613 300.8V345.4M613 357.2V364.2M620 319.6V364.2M627 329V345.4" stroke-width="2.7"/><path class="b2" d="M32 159.8V166.8M39 451.2V458.2M60 65.8V72.8M109 18.8V25.8M186 216.2V232.6M193 206.8V213.8M200 197.4V204.4M207 197.4V204.4M207 235V251.4M214 197.4V204.4M214 244.4V251.4M221 197.4V204.4M221 244.4V251.4M228 197.4V204.4M228 244.4V251.4M235 197.4V204.4M235 235V242M242 197.4V251.4M249 197.4V242M249 253.8V260.8M256 178.6V204.4M256 216.2V270.2M263 178.6V204.4M263 225.6V270.2M270 159.8V185.6M270 244.4V270.2M277 169.2V176.2M277 263.2V289M284 150.4V176.2M284 272.6V289M291 159.8V176.2M291 272.6V289M298 112.8V119.8M298 150.4V176.2M298 272.6V289M305 150.4V157.4M305 282V289M312 150.4V157.4M312 282V298.4M319 150.4V166.8M319 282V289M319 394.8V411.2M326 150.4V166.8M326 272.6V298.4M326 366.6V420.6M333 150.4V176.2M333 272.6V289M333 376V430M340 159.8V166.8M340 272.6V298.4M340 366.6V430M347 150.4V176.2M347 272.6V289M347 366.6V420.6M354 159.8V176.2M354 272.6V289M354 376V420.6M361 159.8V195M361 253.8V289M361 385.4V420.6M368 169.2V185.6M368 206.8V213.8M368 253.8V279.6M368 385.4V392.4M375 178.6V213.8M375 244.4V270.2M382 188V260.8M389 197.4V204.4M389 216.2V242M508 94V110.4M508 122.2V138.6M515 94V138.6M522 84.6V138.6M522 329V336M529 75.2V157.4M529 300.8V307.8M529 319.6V354.8M536 84.6V91.6M536 103.4V119.8M536 131.6V157.4M536 291.4V364.2M543 75.2V91.6M543 103.4V110.4M543 122.2V129.2M543 141V166.8M543 282V326.6M543 338.4V383M550 75.2V91.6M550 103.4V110.4M550 122.2V129.2M550 141V166.8M550 282V307.8M550 319.6V326.6M550 357.2V383M557 84.6V119.8M557 131.6V148M557 282V307.8M557 366.6V392.4M564 84.6V129.2M564 141V157.4M564 282V298.4M564 357.2V364.2M564 376V392.4M571 84.6V148M571 272.6V289M571 300.8V307.8M571 385.4V401.8M578 94V148M578 272.6V289M578 300.8V307.8M578 385.4V401.8M585 94V110.4M585 122.2V138.6M585 272.6V289M585 385.4V401.8M592 112.8V119.8M592 272.6V289M592 376V392.4M599 272.6V298.4M599 376V392.4M606 282V298.4M606 376V392.4M613 282V298.4M613 347.8V354.8M613 366.6V392.4M620 291.4V317.2M620 366.6V392.4M627 291.4V326.6M627 347.8V383M634 310.2V364.2M641 300.8V307.8M641 319.6V364.2M648 319.6V326.6M655 197.4V213.8M662 197.4V223.2M669 188V213.8M676 197.4V213.8M683 197.4V204.4" stroke-width="1.8"/><path class="b3" d="M18 347.8V354.8M88 235V242M88 263.2V270.2M95 56.4V63.4M130 75.2V82.2M137 282V289M137 310.2V317.2M165 94V101M179 206.8V232.6M186 197.4V213.8M186 235V251.4M193 188V204.4M193 235V251.4M200 188V195M200 244.4V251.4M207 188V195M207 253.8V260.8M214 188V195M214 253.8V260.8M221 65.8V72.8M221 178.6V195M221 253.8V260.8M228 178.6V195M228 253.8V270.2M235 169.2V195M235 244.4V270.2M242 159.8V195M242 253.8V279.6M249 159.8V195M249 244.4V251.4M249 263.2V289M256 150.4V176.2M256 272.6V298.4M263 141V176.2M263 272.6V298.4M270 141V157.4M270 272.6V298.4M277 37.6V44.6M277 131.6V166.8M277 291.4V307.8M284 131.6V148M284 291.4V317.2M291 131.6V157.4M291 291.4V317.2M298 131.6V148M298 291.4V317.2M298 376V411.2M305 131.6V148M305 291.4V317.2M305 366.6V430M312 122.2V148M312 300.8V326.6M312 347.8V439.4M319 122.2V148M319 291.4V326.6M319 357.2V392.4M319 413.6V439.4M326 122.2V148M326 300.8V317.2M326 347.8V364.2M326 423V448.8M333 131.6V148M333 291.4V317.2M333 347.8V373.6M333 432.4V448.8M340 131.6V157.4M340 300.8V326.6M340 347.8V364.2M340 432.4V439.4M347 131.6V148M347 291.4V317.2M347 338.4V364.2M347 423V448.8M354 131.6V157.4M354 291.4V317.2M354 347.8V373.6M354 423V439.4M361 131.6V157.4M361 291.4V307.8M361 347.8V383M361 423V439.4M368 141V166.8M368 282V298.4M368 357.2V383M368 394.8V439.4M375 141V176.2M375 272.6V298.4M375 357.2V430M382 150.4V185.6M382 263.2V289M382 366.6V420.6M389 150.4V195M389 206.8V213.8M389 244.4V289M389 376V411.2M396 159.8V270.2M403 178.6V270.2M410 197.4V242M410 253.8V260.8M417 216.2V232.6M480 103.4V119.8M487 94V138.6M494 75.2V157.4M501 65.8V166.8M501 282V289M501 310.2V364.2M508 65.8V91.6M508 112.8V119.8M508 141V176.2M508 291.4V373.6M515 65.8V91.6M515 141V176.2M515 291.4V383M522 56.4V82.2M522 141V176.2M522 272.6V326.6M522 338.4V401.8M529 56.4V72.8M529 159.8V176.2M529 272.6V298.4M529 310.2V317.2M529 357.2V401.8M536 56.4V82.2M536 159.8V185.6M536 263.2V289M536 366.6V411.2M543 47V72.8M543 169.2V185.6M543 263.2V279.6M543 385.4V420.6M550 56.4V72.8M550 169.2V185.6M550 253.8V279.6M550 385.4V420.6M557 47V82.2M557 150.4V185.6M557 253.8V279.6M557 394.8V420.6M564 56.4V82.2M564 159.8V185.6M564 253.8V279.6M564 394.8V420.6M571 56.4V82.2M571 150.4V185.6M571 253.8V270.2M571 404.2V420.6M578 56.4V91.6M578 150.4V176.2M578 253.8V270.2M578 404.2V420.6M585 37.6V44.6M585 65.8V91.6M585 112.8V119.8M585 141V176.2M585 244.4V270.2M585 404.2V420.6M592 65.8V110.4M592 122.2V166.8M592 253.8V270.2M592 394.8V420.6M599 84.6V166.8M599 244.4V270.2M599 394.8V420.6M606 84.6V138.6M606 253.8V279.6M606 394.8V420.6M613 103.4V119.8M613 253.8V279.6M613 394.8V420.6M620 253.8V289M620 394.8V411.2M627 188V195M627 253.8V289M627 385.4V411.2M634 197.4V213.8M634 272.6V307.8M634 366.6V401.8M641 188V232.6M641 263.2V298.4M641 310.2V317.2M641 366.6V401.8M648 178.6V232.6M648 272.6V317.2M648 329V401.8M655 178.6V195M655 216.2V242M655 282V383M662 178.6V195M662 225.6V242M662 291.4V364.2M669 178.6V185.6M669 216.2V242M669 319.6V326.6M669 347.8V364.2M676 178.6V195M676 216.2V242M683 178.6V195M683 206.8V242M690 188V232.6M697 197.4V223.2" stroke-width="1.1"/><path class="sp" d="M214 209.2v1.2M214 218.6v1.2M277 209.2v1.2M277 228v1.2M284 209.2v1.2M291 190.4v1.2M291 218.6v1.2M291 237.4v1.2M291 246.8v1.2M298 190.4v1.2M298 209.2v1.2M298 237.4v1.2M298 246.8v1.2M305 199.8v1.2M312 190.4v1.2M312 199.8v1.2M312 228v1.2M312 237.4v1.2M319 190.4v1.2M319 209.2v1.2M319 218.6v1.2M319 228v1.2M319 237.4v1.2M319 256.2v1.2M326 181v1.2M326 199.8v1.2M326 209.2v1.2M326 237.4v1.2M326 246.8v1.2M333 190.4v1.2M333 199.8v1.2M333 209.2v1.2M333 246.8v1.2M340 199.8v1.2M340 209.2v1.2M340 218.6v1.2M340 237.4v1.2M340 246.8v1.2M347 190.4v1.2M347 209.2v1.2M347 218.6v1.2M571 340.8v1.2M578 331.4v1.2M578 340.8v1.2M585 331.4v1.2M592 322v1.2M592 331.4v1.2"/></g>
<path class="bm" d="M25 336.25V341.25M32 333.5V337M39 329.5V333M46 325.5V329M53 321.5V325M60 317.46V321M67 312.64V316.93M74 308.35V312.1M81 304.06V307.81M88 299.23V303.52M95 294.94V298.69M102 290.65V294.4M109 285.82V290.11M116 281.53V285.28M123 277.24V280.99M130 272.41V276.7M137 268.12V271.88M144 263.3V267.59M151 259.01V262.76M158 254.72V258.47M165 249.89V254.18M172 245.6V249.35M179 241.31V245.06M186 236.48V240.77M193 232.19V235.94M200 227.9V231.65M207 223.07V227.36M214 219.77V224.77"/>
<g class="chip"><rect class="cf" x="25" y="340" width="122" height="15" rx="3"/><text x="31" y="350.5" font-family="monospace" font-size="7.5" font-weight="700" fill="#ffffff">MULTI-CHAIN PROTOCOL</text></g>
<g class="chip"><rect class="cf" x="515" y="74" width="124" height="15" rx="3"/><text x="521" y="84.5" font-family="monospace" font-size="7.5" font-weight="700" fill="#ffffff">NEAR MPC NETWORK</text></g>
<g class="m"><g class="mb"><path class="bx" pathLength="1" d="M244 148H396V296H244Z"/><circle class="dot" cx="244" cy="148" r="2.2"/><circle class="dot" cx="396" cy="148" r="2.2"/><circle class="dot" cx="244" cy="296" r="2.2"/><circle class="dot" cx="396" cy="296" r="2.2"/><g class="chip"><rect class="cf" x="244" y="148" width="145" height="15" rx="3"/><text x="250" y="159" font-family="monospace" font-size="8.5" font-weight="700" fill="#ffffff">NEAR MPC: CHAIN SIGS</text></g><text x="252" y="176" font-family="monospace" font-size="8" font-weight="600" fill="var(--illos-mark)" opacity="0.95">PSA 10 RWA // MINT 9eHM...r8</text><text x="252" y="190" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.8">BRINK&apos;S CUSTODY: PARIS</text><text x="252" y="204" font-family="monospace" font-size="7.5" font-weight="600" fill="#10b981">ORACLE VALUE: $1,280 USDC</text><path class="bx" stroke-dasharray="3 3" d="M252 216H388V286H252Z"/><text x="260" y="235" font-family="monospace" font-size="7.5" font-weight="600" fill="var(--illos-mark)" opacity="0.9">CROSS-CHAIN ATOMIC</text><text x="260" y="249" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.75">MULTI-PARTY COMPUTATION</text><text x="260" y="263" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.75">KEY DERIVATION PATH: m/44&apos;</text></g></g>
<rect class="sh-clock" width="0" height="0"/>
<metadata class="illos-field" data-cycle="4.2"><![CDATA[float field(vec2 p, float t) {
  float v = 0.0;
  vec4 C[4];
  C[0] = vec4(540.0, 118.0, 52.0, 0.62); C[1] = vec4(585.0, 330.0, 64.0, 0.85);
  C[2] = vec4(350.0, 398.0, 40.0, 0.5); C[3] = vec4(664.0, 214.0, 32.0, 0.42);
  for (int i = 0; i < 4; i++) {
    float ph = TAU * t / T + float(i) * 1.7;
    v += blob(p, C[i].xy + vec2(7.0 * cos(ph), 6.0 * sin(ph)), C[i].z * (1.0 + 0.08 * sin(2.0 * ph)), C[i].w);
  }
  float heat = max(1.0 - sm(0.0, 0.6, t), sm(2.8, 3.3, t));
  v += blob(p, vec2(318.0, 222.0), 60.0 * (1.0 + 0.06 * heat), 0.8 + 0.45 * heat);
  vec2 S = vec2(62.0, 318.0); vec2 D = vec2(212.0, 222.0);
  float u = clamp((t - 0.8) / 1.8, 0.0, 1.0);
  vec2 q = t < 0.6 ? D : mix(S, D, ease(u));
  float k = t < 0.6 ? 1.05 * (1.0 - sm(0.0, 0.6, t)) : 1.05 * sm(0.6, 0.9, t);
  float speed = (u > 0.0 && u < 1.0) ? sin(3.14159 * u) : 0.0;
  vec2 dir = normalize(D - S);
  v += blob(p, q, 24.0, k);
  for (int s = 1; s <= 4; s++) v += blob(p, q - dir * 16.0 * float(s), 24.0 - 4.0 * float(s), k * speed * (0.55 - 0.12 * float(s)));
  if (t > 2.6 && t < 3.95) {
    float R = 30.0 + 320.0 * sm(2.6, 3.9, t);
    v += 0.42 * (1.0 - sm(2.6, 3.95, t)) * exp(-pow(length(p - D) - R, 2.0) / 260.0) * (v > 0.05 ? 1.6 : 1.0);
  }
  if (hash(floor(p / vec2(7.0, 9.4)) * vec2(7.0, 3.0)) > 0.992) v = max(v, 0.3);
  return v;
}]]></metadata>
</svg>`,
  "cache-layer": `<svg class="sh-cache-layer" xmlns="http://www.w3.org/2000/svg" width="720" height="460" viewBox="0 0 720 460" fill="none" role="img" aria-labelledby="sh-cache-layer-t">
<title id="sh-cache-layer-t">NFTs as Accounts</title>
<style>@scope (svg.sh-cache-layer) {
:scope{--_ground:#ffffff;--_ink:#2a2a2a;--_ramp-1:#073525;--_ramp-2:#10b981;--_ramp-3:#34d399;--_ramp-4:#a7f3d0;--_mark:#059669;--_spark:#047857}
:scope:is(.dark *){--_ground:#101112;--_ink:#dadadc;--_ramp-1:#6ee7b7;--_ramp-2:#10b981;--_ramp-3:#059669;--_ramp-4:#064e3b;--_mark:#10b981;--_spark:#ffffff}
:scope{--g:var(--illos-ground,var(--_ground));--k:var(--illos-ink,var(--_ink))}
.b0,.b1,.b2,.b3{fill:none;stroke-dasharray:7 2.4}
.b0{stroke:var(--illos-ramp-1,var(--_ramp-1))}.b1{stroke:var(--illos-ramp-2,var(--_ramp-2))}.b2{stroke:var(--illos-ramp-3,var(--_ramp-3))}.b3{stroke:var(--illos-ramp-4,var(--_ramp-4));opacity:.55}
.sc{fill:none;stroke:color-mix(in srgb,var(--illos-ramp-4,var(--_ramp-4)) 18%,var(--g));stroke-width:.8}
.bm{fill:none;stroke:var(--illos-ramp-2,var(--_ramp-2));stroke-width:2.4;stroke-dasharray:5 2.4}
.sp{fill:none;stroke:var(--illos-spark,var(--_spark));stroke-width:1.2;stroke-linecap:round;opacity:.85}
.gr{stroke:color-mix(in srgb,var(--k) 9%,var(--g));stroke-width:1}
.bx,.ln,.lv{fill:none;stroke:var(--illos-mark,var(--_mark));stroke-width:1.2}
.dot{fill:var(--illos-mark,var(--_mark))}.cf{fill:var(--illos-mark,var(--_mark))}
.ct{fill:none;stroke:var(--g);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round}
@keyframes sh-cache-layer_hit{0%{opacity:1}39.762%{opacity:1}43.571%{opacity:0}87.381%{opacity:0}91.19%{opacity:1}100%{opacity:1}}
.hit{opacity:1;animation:sh-cache-layer_hit 4.2s linear both}
@keyframes sh-cache-layer_miss{0%{opacity:0}39.762%{opacity:0}43.571%{opacity:1}87.381%{opacity:1}91.19%{opacity:0}100%{opacity:0}}
.miss{opacity:0;animation:sh-cache-layer_miss 4.2s linear both}
@keyframes sh-cache-layer_clock{0%{opacity:0}100%{opacity:0}}
.sh-clock{animation:sh-cache-layer_clock 4.2s linear both}
*{animation-iteration-count:1!important;animation-fill-mode:both!important;animation-play-state:var(--illos-play,running)!important}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
}
</style>
<g class="sh-still"><path class="sc" d="M4 0V460M11 0V460M18 0V460M25 0V460M32 0V460M39 0V460M46 0V460M53 0V460M60 0V460M67 0V460M74 0V460M81 0V460M88 0V460M95 0V460M102 0V460M109 0V460M116 0V460M123 0V460M130 0V460M137 0V460M144 0V460M151 0V460M158 0V460M165 0V460M172 0V460M179 0V460M186 0V460M193 0V460M200 0V460M207 0V460M214 0V460M221 0V460M228 0V460M235 0V460M242 0V460M249 0V460M256 0V460M263 0V460M270 0V460M277 0V460M284 0V460M291 0V460M298 0V460M305 0V460M312 0V460M319 0V460M326 0V460M333 0V460M340 0V460M347 0V460M354 0V460M361 0V460M368 0V460M375 0V460M382 0V460M389 0V460M396 0V460M403 0V460M410 0V460M417 0V460M424 0V460M431 0V460M438 0V460M445 0V460M452 0V460M459 0V460M466 0V460M473 0V460M480 0V460M487 0V460M494 0V460M501 0V460M508 0V460M515 0V460M522 0V460M529 0V460M536 0V460M543 0V460M550 0V460M557 0V460M564 0V460M571 0V460M578 0V460M585 0V460M592 0V460M599 0V460M606 0V460M613 0V460M620 0V460M627 0V460M634 0V460M641 0V460M648 0V460M655 0V460M662 0V460M669 0V460M676 0V460M683 0V460M690 0V460M697 0V460M704 0V460M711 0V460M718 0V460"/><path class="gr" d="M0 0V460M96 0V460M192 0V460M288 0V460M384 0V460M480 0V460M576 0V460M672 0V460M0 0H720M0 96H720M0 192H720M0 288H720M0 384H720"/><path class="b0" d="M81 244.4V260.8M88 244.4V251.4M298 244.4V251.4M305 253.8V260.8" stroke-width="3.6"/><path class="b1" d="M74 235V251.4M81 235V242M81 263.2V270.2M88 235V242M88 253.8V260.8M95 235V260.8M277 253.8V260.8M284 244.4V270.2M291 225.6V270.2M298 225.6V242M298 253.8V270.2M305 225.6V251.4M305 263.2V279.6M312 235V270.2M319 235V260.8M326 253.8V260.8M480 291.4V307.8M487 300.8V307.8M494 263.2V270.2M494 291.4V336M501 263.2V270.2M501 300.8V317.2M501 329V345.4M508 272.6V279.6M508 291.4V298.4M508 310.2V326.6M515 253.8V270.2M515 300.8V354.8M522 263.2V317.2M522 329V354.8M529 291.4V307.8M529 319.6V336M529 347.8V364.2M536 272.6V279.6M536 291.4V307.8M536 319.6V364.2M543 282V289M543 300.8V364.2M550 272.6V317.2M550 329V373.6M557 253.8V260.8M557 272.6V289M557 310.2V326.6M557 338.4V373.6M564 300.8V307.8M564 319.6V373.6M571 291.4V298.4M571 310.2V373.6M578 253.8V260.8M578 291.4V298.4M578 310.2V345.4M578 357.2V373.6M585 253.8V260.8M585 282V307.8M585 319.6V364.2M592 282V364.2M599 272.6V279.6M599 319.6V326.6M599 338.4V364.2M606 253.8V260.8M606 300.8V364.2M613 300.8V326.6M613 338.4V354.8M620 272.6V279.6M620 319.6V354.8M627 253.8V260.8M627 282V345.4M634 282V298.4M634 310.2V336M641 282V307.8M641 319.6V326.6M648 272.6V279.6M648 291.4V307.8M655 272.6V279.6" stroke-width="2.7"/><path class="b2" d="M67 235V260.8M74 253.8V270.2M81 225.6V232.6M88 225.6V232.6M88 263.2V270.2M95 263.2V270.2M102 235V270.2M263 235V270.2M270 225.6V270.2M277 216.2V251.4M277 263.2V289M284 206.8V242M284 272.6V289M291 206.8V223.2M291 272.6V289M298 206.8V223.2M298 272.6V289M305 216.2V223.2M305 282V289M312 206.8V232.6M312 272.6V279.6M319 216.2V232.6M319 263.2V289M326 216.2V251.4M326 263.2V279.6M333 235V270.2M340 235V260.8M473 263.2V289M480 235V289M480 310.2V317.2M487 225.6V298.4M487 310.2V326.6M494 206.8V260.8M494 272.6V289M501 197.4V260.8M501 272.6V298.4M501 319.6V326.6M508 197.4V270.2M508 282V289M508 300.8V307.8M508 329V354.8M515 188V251.4M515 272.6V298.4M522 188V260.8M522 319.6V326.6M522 357.2V364.2M529 188V289M529 310.2V317.2M529 338.4V345.4M536 178.6V270.2M536 282V289M536 310.2V317.2M543 178.6V279.6M543 291.4V298.4M543 366.6V373.6M550 178.6V270.2M550 319.6V326.6M557 169.2V251.4M557 263.2V270.2M557 291.4V307.8M557 329V336M564 178.6V298.4M564 310.2V317.2M571 178.6V289M571 300.8V307.8M578 178.6V251.4M578 263.2V289M578 300.8V307.8M578 347.8V354.8M585 178.6V251.4M585 263.2V279.6M585 310.2V317.2M585 366.6V373.6M592 178.6V279.6M592 366.6V373.6M599 178.6V270.2M599 282V317.2M599 329V336M606 188V251.4M606 263.2V298.4M613 188V298.4M613 329V336M613 357.2V364.2M620 197.4V270.2M620 282V317.2M627 197.4V251.4M627 263.2V279.6M634 206.8V279.6M634 300.8V307.8M641 216.2V279.6M641 310.2V317.2M648 225.6V270.2M648 282V289M648 310.2V317.2M655 253.8V270.2M655 282V298.4" stroke-width="1.8"/><path class="b3" d="M60 235V270.2M67 225.6V232.6M67 263.2V270.2M74 225.6V232.6M74 272.6V279.6M81 216.2V223.2M81 272.6V279.6M88 216.2V223.2M88 272.6V279.6M95 216.2V232.6M95 272.6V279.6M102 225.6V232.6M102 272.6V279.6M109 225.6V270.2M116 235V260.8M242 235V251.4M249 216.2V279.6M256 206.8V289M263 206.8V232.6M263 272.6V298.4M270 197.4V223.2M270 272.6V298.4M277 197.4V213.8M277 291.4V298.4M284 197.4V204.4M284 291.4V307.8M291 188V204.4M291 291.4V307.8M298 188V204.4M298 291.4V307.8M305 197.4V213.8M305 291.4V307.8M312 188V204.4M312 282V307.8M319 197.4V213.8M319 291.4V307.8M326 197.4V213.8M326 282V298.4M333 197.4V232.6M333 272.6V298.4M340 206.8V232.6M340 263.2V298.4M347 216.2V289M354 225.6V279.6M361 244.4V251.4M473 244.4V260.8M473 291.4V307.8M480 225.6V232.6M480 319.6V326.6M487 216.2V223.2M487 329V336M494 338.4V345.4M501 347.8V354.8M508 188V195M515 357.2V364.2M522 178.6V185.6M529 178.6V185.6M529 366.6V373.6M536 169.2V176.2M536 366.6V373.6M543 169.2V176.2M550 169.2V176.2M564 169.2V176.2M571 169.2V176.2M578 169.2V176.2M585 169.2V176.2M592 169.2V176.2M599 366.6V373.6M606 178.6V185.6M613 178.6V185.6M620 188V195M627 347.8V354.8M634 197.4V204.4M634 338.4V345.4M641 206.8V213.8M641 329V336M648 216.2V223.2M648 319.6V326.6M655 235V251.4M655 300.8V307.8" stroke-width="1.1"/><path class="sp" d="M81 246.8v1.2M81 256.2v1.2M88 246.8v1.2M298 246.8v1.2"/></g>
<g class="box"><path class="bx" pathLength="1" d="M56 220H124V280H56Z"/><circle class="dot" cx="56" cy="220" r="2.2"/><circle class="dot" cx="124" cy="220" r="2.2"/><circle class="dot" cx="56" cy="280" r="2.2"/><circle class="dot" cx="124" cy="280" r="2.2"/><g class="chip"><rect class="cf" x="56" y="220" width="88" height="15" rx="3"/><text x="61" y="231" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">NEP-171 NFT</text></g><text x="60" y="250" font-family="monospace" font-size="7.5" font-weight="600" fill="var(--illos-mark)" opacity="0.95">SMART ID</text><text x="60" y="262" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.8">ON-CHAIN</text><text x="60" y="274" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.8">IDENTITY</text></g><path class="bx" d="M248 196H356V304H248Z"/><circle class="dot" cx="248" cy="196" r="2.2"/><circle class="dot" cx="356" cy="196" r="2.2"/><circle class="dot" cx="248" cy="304" r="2.2"/><circle class="dot" cx="356" cy="304" r="2.2"/><g class="hit"><g class="chip"><rect class="cf" x="248" y="180" width="128" height="15" rx="3"/><text x="254" y="191" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">USDC VAULT: $513</text></g><text x="254" y="222" font-family="monospace" font-size="8" font-weight="600" fill="var(--illos-mark)" opacity="0.95">SUB-ACCOUNT READY</text><text x="254" y="238" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.8">vault-6.near</text><text x="254" y="254" font-family="monospace" font-size="7.5" font-weight="700" fill="#10b981">LIQUIDITY ATTESTED</text><text x="254" y="270" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.7">AUTONOMOUS SETTLEMENT</text></g><g class="miss"><g class="chip"><rect class="cf" x="248" y="180" width="138" height="15" rx="3"/><text x="254" y="191" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">FETCHING PHYSICAL</text></g><text x="254" y="222" font-family="monospace" font-size="8" font-weight="600" fill="var(--illos-mark)" opacity="0.95">VERIFYING AUDIT</text><text x="254" y="238" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.8">vault-6.near</text><text x="254" y="254" font-family="monospace" font-size="7.5" font-weight="700" fill="#10b981">PROOF OF CUSTODY</text><text x="254" y="270" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.7">ORACLE SYNC ACTIVE</text></g><g class="box"><path class="bx" pathLength="1" d="M448 142H682V404H448Z"/><circle class="dot" cx="448" cy="142" r="2.2"/><circle class="dot" cx="682" cy="142" r="2.2"/><circle class="dot" cx="448" cy="404" r="2.2"/><circle class="dot" cx="682" cy="404" r="2.2"/><g class="chip"><rect class="cf" x="448" y="142" width="156" height="15" rx="3"/><text x="454" y="153" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">BRINK&apos;S PHYSICAL VAULT</text></g><text x="454" y="174" font-family="monospace" font-size="8.5" font-weight="600" fill="var(--illos-mark)" opacity="0.95">3 PSA 10 SLABS ENCLOSED</text><text x="454" y="190" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.8">BARCODE // NFC VERIFIED</text><text x="454" y="206" font-family="monospace" font-size="7.5" font-weight="600" fill="#10b981">100% REPUTATION SCORE</text><text x="454" y="222" font-family="monospace" font-size="7.5" font-weight="500" fill="var(--illos-mark)" opacity="0.75">INSURED CUSTODY (LLOYD&apos;S)</text><text x="454" y="238" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.6">VAULT ID: #0049-BRK-FR</text></g><rect class="sh-clock" width="0" height="0"/>
<metadata class="illos-field" data-cycle="4.2"><![CDATA[vec3 drop(float t) {
  vec2 A = vec2(108.0, 250.0), P = vec2(262.0, 250.0), C = vec2(300.0, 250.0), O = vec2(344.0, 252.0), R = vec2(470.0, 262.0), B = vec2(560.0, 316.0);
  if (t < 0.15) return vec3(A, 0.0);
  if (t < 0.5) return vec3(mix(A, P, ease((t - 0.15) / 0.35)), 1.2 * sm(0.15, 0.22, t));
  if (t < 0.95) return vec3(mix(P, A, ease((t - 0.55) / 0.4)), 1.2 * (1.0 - sm(0.85, 0.95, t)) * step(0.55, t) + 1.2 * step(t, 0.55));
  if (t < 1.3) return vec3(A, 0.0);
  if (t < 1.65) return vec3(mix(A, P, ease((t - 1.3) / 0.35)), 1.2 * sm(1.3, 1.37, t));
  if (t < 1.8) return vec3(mix(P, O, (t - 1.65) / 0.15), 1.2);
  if (t < 2.4) return vec3(mix(O, R, ease((t - 1.8) / 0.6)), 1.2);
  if (t < 2.9) return vec3(mix(R, B, 1.0 - pow(1.0 - (t - 2.4) / 0.5, 2.0)), 1.2);
  if (t < 3.35) return vec3(mix(B, C, ease((t - 2.95) / 0.4)), 1.2 * step(2.95, t));
  if (t < 3.85) return vec3(mix(C, A, ease((t - 3.4) / 0.45)), 1.2 * (1.0 - sm(3.75, 3.85, t)));
  return vec3(A, 0.0);
}
float ring(vec2 p, vec2 c, float t, float t0, float dur, float rmax, float k) {
  if (t < t0 || t > t0 + dur) return 0.0;
  float u = (t - t0) / dur;
  return k * (1.0 - u) * exp(-pow(length((p - c) * vec2(1.0, 1.6)) - 8.0 - rmax * u, 2.0) / 30.0);
}
float field(vec2 p, float t) {
  vec2 C = vec2(300.0, 250.0);
  float v = blob(p, vec2(86.0, 250.0), 22.0, 0.95);
  // the pool: small and hot, its surface rippling where things land
  float kept = sm(3.3, 3.45, t) * (1.0 - sm(3.6, 4.1, t));
  v += blob(p, C, 44.0, 0.78 + 0.45 * kept);
  v += ring(p, C, t, 0.5, 0.6, 52.0, 0.55) + ring(p, C, t, 1.65, 0.45, 40.0, 0.35) + ring(p, C, t, 3.35, 0.55, 52.0, 0.5);
  // the reservoir: wide and deep, denser the deeper it goes, stirring when something sinks in
  vec2 d = (p - vec2(565.0, 272.0)) / vec2(108.0, 118.0);
  float body = exp(-pow(max(0.0, length(d) - 0.82), 2.0) / 0.004) * step(length(d), 1.0);
  float stir = sm(2.4, 2.6, t) * (1.0 - sm(2.9, 3.4, t));
  v += body * (0.3 + 0.45 * clamp((p.y - 154.0) / 236.0, 0.0, 1.0) + 0.3 * stir * noise(p * 0.05 + t));
  v += ring(p, vec2(470.0, 262.0), t, 2.4, 0.7, 70.0, 0.4);
  vec3 q = drop(t);
  return v + blob(p, q.xy, 11.0, q.z);
}]]></metadata>
</svg>`,
  "rate-limit": `<svg class="sh-rate-limit" xmlns="http://www.w3.org/2000/svg" width="720" height="460" viewBox="0 0 720 460" fill="none" role="img" aria-labelledby="sh-rate-limit-t">
<title id="sh-rate-limit-t">Secure Agent-to-Agent Trading</title>
<style>@scope (svg.sh-rate-limit) {
:scope{--_ground:#ffffff;--_ink:#2a2a2a;--_ramp-1:#073525;--_ramp-2:#10b981;--_ramp-3:#34d399;--_ramp-4:#a7f3d0;--_mark:#059669;--_spark:#047857}
:scope:is(.dark *){--_ground:#101112;--_ink:#dadadc;--_ramp-1:#6ee7b7;--_ramp-2:#10b981;--_ramp-3:#059669;--_ramp-4:#064e3b;--_mark:#10b981;--_spark:#ffffff}
:scope{--g:var(--illos-ground,var(--_ground));--k:var(--illos-ink,var(--_ink))}
.b0,.b1,.b2,.b3{fill:none;stroke-dasharray:7 2.4}
.b0{stroke:var(--illos-ramp-1,var(--_ramp-1))}.b1{stroke:var(--illos-ramp-2,var(--_ramp-2))}.b2{stroke:var(--illos-ramp-3,var(--_ramp-3))}.b3{stroke:var(--illos-ramp-4,var(--_ramp-4));opacity:.55}
.sc{fill:none;stroke:color-mix(in srgb,var(--illos-ramp-4,var(--_ramp-4)) 18%,var(--g));stroke-width:.8}
.bm{fill:none;stroke:var(--illos-ramp-2,var(--_ramp-2));stroke-width:2.4;stroke-dasharray:5 2.4}
.sp{fill:none;stroke:var(--illos-spark,var(--_spark));stroke-width:1.2;stroke-linecap:round;opacity:.85}
.gr{stroke:color-mix(in srgb,var(--k) 9%,var(--g));stroke-width:1}
.bx,.ln,.lv{fill:none;stroke:var(--illos-mark,var(--_mark));stroke-width:1.2}
.dot{fill:var(--illos-mark,var(--_mark))}.cf{fill:var(--illos-mark,var(--_mark))}
.ct{fill:none;stroke:var(--g);stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round}
@keyframes sh-rate-limit_r0{0%{transform:translate(0.00px,0px);opacity:1;animation-timing-function:linear}66.667%{transform:translate(-280.00px,0px);opacity:1;animation-timing-function:linear}73.81%{transform:translate(-310.00px,0px);opacity:0;animation-timing-function:linear}100%{transform:translate(-420.00px,0px);opacity:0;animation-timing-function:linear}}
.r0{transform:translate(0.00px,0px);opacity:1;animation:sh-rate-limit_r0 4.2s linear both}
@keyframes sh-rate-limit_r1{0%{transform:translate(420.00px,0px);opacity:0;animation-timing-function:linear}55.952%{transform:translate(185.00px,0px);opacity:0;animation-timing-function:linear}63.095%{transform:translate(155.00px,0px);opacity:1;animation-timing-function:linear}100%{transform:translate(0.00px,0px);opacity:1;animation-timing-function:linear}}
.r1{transform:translate(420.00px,0px);opacity:0;animation:sh-rate-limit_r1 4.2s linear both}
@keyframes sh-rate-limit_clock{0%{opacity:0}100%{opacity:0}}
.sh-clock{animation:sh-rate-limit_clock 4.2s linear both}
*{animation-iteration-count:1!important;animation-fill-mode:both!important;animation-play-state:var(--illos-play,running)!important}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
}
</style>
<g class="sh-still"><path class="sc" d="M4 0V460M11 0V460M18 0V460M25 0V460M32 0V460M39 0V460M46 0V460M53 0V460M60 0V460M67 0V460M74 0V460M81 0V460M88 0V460M95 0V460M102 0V460M109 0V460M116 0V460M123 0V460M130 0V460M137 0V460M144 0V460M151 0V460M158 0V460M165 0V460M172 0V460M179 0V460M186 0V460M193 0V460M200 0V460M207 0V460M214 0V460M221 0V460M228 0V460M235 0V460M242 0V460M249 0V460M256 0V460M263 0V460M270 0V460M277 0V460M284 0V460M291 0V460M298 0V460M305 0V460M312 0V460M319 0V460M326 0V460M333 0V460M340 0V460M347 0V460M354 0V460M361 0V460M368 0V460M375 0V460M382 0V460M389 0V460M396 0V460M403 0V460M410 0V460M417 0V460M424 0V460M431 0V460M438 0V460M445 0V460M452 0V460M459 0V460M466 0V460M473 0V460M480 0V460M487 0V460M494 0V460M501 0V460M508 0V460M515 0V460M522 0V460M529 0V460M536 0V460M543 0V460M550 0V460M557 0V460M564 0V460M571 0V460M578 0V460M585 0V460M592 0V460M599 0V460M606 0V460M613 0V460M620 0V460M627 0V460M634 0V460M641 0V460M648 0V460M655 0V460M662 0V460M669 0V460M676 0V460M683 0V460M690 0V460M697 0V460M704 0V460M711 0V460M718 0V460"/><path class="gr" d="M0 0V460M96 0V460M192 0V460M288 0V460M384 0V460M480 0V460M576 0V460M672 0V460M0 0H720M0 96H720M0 192H720M0 288H720M0 384H720"/><path class="b0" d="M60 357.2V373.6M60 394.8V401.8M67 357.2V373.6M67 385.4V401.8M74 385.4V401.8M88 394.8V401.8M95 394.8V401.8M116 385.4V401.8M123 385.4V401.8M130 385.4V392.4M137 394.8V401.8M144 376V401.8M151 385.4V401.8M158 385.4V392.4M165 385.4V401.8M172 376V383M172 394.8V401.8M179 366.6V392.4M186 357.2V364.2M186 385.4V392.4M193 376V401.8M200 385.4V392.4M207 394.8V401.8M214 394.8V401.8M228 394.8V401.8M235 385.4V401.8M249 385.4V401.8M256 394.8V401.8M263 394.8V401.8M270 394.8V401.8M277 376V383M277 394.8V401.8M284 385.4V392.4M291 394.8V401.8M298 376V383M298 394.8V401.8M305 376V401.8M312 376V392.4M319 376V383M326 366.6V383M333 385.4V401.8M340 376V401.8M347 385.4V401.8M361 385.4V401.8M368 357.2V392.4M375 366.6V383M382 366.6V373.6M382 385.4V392.4M389 347.8V354.8M389 376V401.8M396 385.4V401.8M403 366.6V373.6M403 385.4V392.4M410 347.8V364.2M410 376V392.4M417 357.2V364.2M417 385.4V392.4M424 385.4V392.4M431 357.2V364.2M431 394.8V401.8M438 338.4V345.4M438 357.2V373.6M438 394.8V401.8M445 347.8V364.2M445 385.4V401.8M452 357.2V364.2M452 376V383M452 394.8V401.8M459 347.8V364.2M459 376V392.4M466 357.2V392.4M473 376V383M480 376V401.8M494 376V392.4M501 394.8V401.8M508 394.8V401.8M515 394.8V401.8M522 394.8V401.8M529 394.8V401.8M536 394.8V401.8M543 385.4V401.8M550 394.8V401.8M557 385.4V401.8M564 385.4V401.8M571 376V401.8M578 376V401.8M585 376V383M585 394.8V401.8M592 394.8V401.8M606 366.6V373.6M606 394.8V401.8M613 376V401.8M620 385.4V401.8M627 394.8V401.8M634 385.4V392.4M641 394.8V401.8M648 385.4V401.8M655 394.8V401.8" stroke-width="3.6"/><path class="b1" d="M60 310.2V354.8M60 376V392.4M67 329V354.8M67 376V383M74 329V383M81 366.6V401.8M88 385.4V392.4M102 385.4V401.8M109 385.4V401.8M116 357.2V383M123 347.8V383M130 338.4V345.4M130 357.2V383M130 394.8V401.8M137 338.4V392.4M144 338.4V345.4M144 366.6V373.6M151 347.8V383M158 338.4V383M158 394.8V401.8M165 338.4V383M172 310.2V326.6M172 338.4V373.6M172 385.4V392.4M179 300.8V307.8M179 319.6V364.2M179 394.8V401.8M186 319.6V354.8M186 366.6V383M186 394.8V401.8M193 319.6V326.6M193 338.4V373.6M200 338.4V345.4M200 357.2V383M200 394.8V401.8M207 366.6V392.4M214 376V392.4M221 385.4V401.8M228 385.4V392.4M235 366.6V383M242 366.6V401.8M249 357.2V383M256 357.2V364.2M256 376V392.4M263 366.6V392.4M270 366.6V392.4M277 385.4V392.4M284 338.4V383M284 394.8V401.8M291 319.6V326.6M291 347.8V392.4M298 319.6V373.6M298 385.4V392.4M305 310.2V317.2M305 329V373.6M312 319.6V373.6M312 394.8V401.8M319 319.6V373.6M319 385.4V401.8M326 347.8V364.2M326 385.4V401.8M333 347.8V383M340 347.8V373.6M347 347.8V383M354 338.4V401.8M361 329V383M368 329V336M368 347.8V354.8M368 394.8V401.8M375 319.6V326.6M375 338.4V364.2M375 385.4V401.8M382 319.6V326.6M382 338.4V364.2M382 376V383M382 394.8V401.8M389 291.4V345.4M389 357.2V373.6M396 291.4V298.4M396 310.2V383M403 253.8V270.2M403 291.4V364.2M403 376V383M403 394.8V401.8M410 216.2V232.6M410 253.8V260.8M410 291.4V345.4M410 366.6V373.6M410 394.8V401.8M417 216.2V232.6M417 263.2V354.8M417 366.6V383M417 394.8V401.8M424 272.6V383M424 394.8V401.8M431 216.2V223.2M431 282V354.8M431 366.6V392.4M438 216.2V232.6M438 272.6V336M438 347.8V354.8M438 376V392.4M445 216.2V232.6M445 253.8V260.8M445 282V345.4M445 366.6V383M452 282V354.8M452 366.6V373.6M452 385.4V392.4M459 282V289M459 300.8V345.4M459 366.6V373.6M459 394.8V401.8M466 300.8V354.8M466 394.8V401.8M473 300.8V373.6M473 385.4V401.8M480 300.8V373.6M487 319.6V401.8M494 357.2V373.6M494 394.8V401.8M501 357.2V392.4M508 385.4V392.4M522 385.4V392.4M529 376V392.4M536 366.6V392.4M543 357.2V383M550 347.8V392.4M557 338.4V383M564 347.8V383M571 338.4V373.6M578 338.4V345.4M578 357.2V373.6M585 329V336M585 347.8V373.6M585 385.4V392.4M592 310.2V392.4M599 319.6V326.6M599 338.4V401.8M606 319.6V364.2M606 376V392.4M613 338.4V373.6M620 347.8V383M627 366.6V392.4M634 394.8V401.8M641 385.4V392.4M648 376V383M655 366.6V392.4" stroke-width="2.7"/><path class="b2" d="M60 272.6V307.8M67 291.4V326.6M74 319.6V326.6M81 347.8V364.2M88 376V383M95 385.4V392.4M109 366.6V383M116 338.4V354.8M123 319.6V345.4M130 319.6V336M130 347.8V354.8M137 319.6V336M144 319.6V336M144 347.8V364.2M151 329V345.4M158 319.6V336M165 310.2V336M172 291.4V307.8M172 329V336M179 282V298.4M179 310.2V317.2M186 282V317.2M193 300.8V317.2M193 329V336M200 329V336M200 347.8V354.8M207 347.8V364.2M221 376V383M228 366.6V383M235 357.2V364.2M242 347.8V364.2M249 338.4V354.8M256 347.8V354.8M256 366.6V373.6M263 357.2V364.2M270 357.2V364.2M277 347.8V373.6M284 329V336M291 300.8V317.2M291 329V345.4M298 282V317.2M305 272.6V307.8M305 319.6V326.6M312 272.6V317.2M319 291.4V317.2M326 319.6V345.4M333 329V345.4M340 338.4V345.4M347 329V345.4M354 310.2V336M361 300.8V326.6M368 291.4V326.6M368 338.4V345.4M375 282V317.2M375 329V336M382 272.6V317.2M382 329V336M389 263.2V289M396 235V289M396 300.8V307.8M403 206.8V213.8M403 225.6V251.4M403 272.6V289M410 206.8V213.8M410 235V251.4M410 263.2V289M417 169.2V185.6M417 235V260.8M424 169.2V176.2M424 188V213.8M424 225.6V270.2M431 169.2V176.2M431 225.6V279.6M438 188V195M438 235V270.2M445 197.4V213.8M445 235V251.4M445 263.2V279.6M452 225.6V279.6M459 225.6V279.6M459 291.4V298.4M466 244.4V298.4M473 253.8V298.4M480 272.6V298.4M487 291.4V317.2M494 319.6V354.8M501 347.8V354.8M508 376V383M515 385.4V392.4M529 366.6V373.6M536 338.4V364.2M543 319.6V354.8M550 319.6V345.4M557 319.6V336M564 319.6V345.4M571 329V336M578 319.6V336M578 347.8V354.8M585 310.2V326.6M585 338.4V345.4M592 291.4V307.8M599 282V317.2M599 329V336M606 282V317.2M613 300.8V336M620 329V345.4M627 347.8V364.2M634 376V383M641 376V383M648 366.6V373.6M655 357.2V364.2" stroke-width="1.8"/><path class="b3" d="M403 197.4V204.4M417 122.2V138.6M417 150.4V157.4M424 112.8V129.2M424 150.4V157.4M431 141V157.4M438 150.4V157.4" stroke-width="1.1"/><path class="sp" d="M60 359.6v1.2M67 359.6v1.2M67 369v1.2M67 387.8v1.2M88 397.2v1.2M116 387.8v1.2M116 397.2v1.2M137 397.2v1.2M144 378.4v1.2M151 387.8v1.2M151 397.2v1.2M172 378.4v1.2M193 378.4v1.2M193 387.8v1.2M193 397.2v1.2M200 387.8v1.2M207 397.2v1.2M228 397.2v1.2M249 387.8v1.2M256 397.2v1.2M263 397.2v1.2M270 397.2v1.2M284 387.8v1.2M291 397.2v1.2M298 378.4v1.2M298 397.2v1.2M305 378.4v1.2M319 378.4v1.2M326 378.4v1.2M333 387.8v1.2M340 378.4v1.2M347 387.8v1.2M368 369v1.2M368 378.4v1.2M368 387.8v1.2M375 378.4v1.2M382 387.8v1.2M389 397.2v1.2M396 387.8v1.2M403 369v1.2M403 387.8v1.2M410 350.2v1.2M410 359.6v1.2M438 340.8v1.2M438 369v1.2M445 359.6v1.2M452 378.4v1.2M459 378.4v1.2M459 387.8v1.2M466 369v1.2M466 378.4v1.2M480 397.2v1.2M494 387.8v1.2M515 397.2v1.2M543 387.8v1.2M543 397.2v1.2M550 397.2v1.2M557 397.2v1.2M564 387.8v1.2M564 397.2v1.2M571 378.4v1.2M571 387.8v1.2M578 387.8v1.2M585 378.4v1.2M592 397.2v1.2M606 369v1.2M634 387.8v1.2M641 397.2v1.2M648 397.2v1.2M655 397.2v1.2"/></g>
<path class="lv lvl" pathLength="1" d="M50 220H665"/>
<g class="chip"><rect class="cf" x="50" y="228" width="186" height="15" rx="3"/><text x="56" y="239" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">ON-CHAIN GUARDRAIL: &lt;$50 USDC</text></g>
<g class="chip"><rect class="cf" x="500" y="228" width="165" height="15" rx="3"/><text x="506" y="239" font-family="monospace" font-size="7.5" font-weight="700" fill="#ffffff">ATOMIC SETTLEMENT READY</text></g>
<g class="r0">
  <g class="box">
    <path class="bx" pathLength="1" d="M370 66H480V220H370Z"/>
    <circle class="dot" cx="370" cy="66" r="2.2"/><circle class="dot" cx="480" cy="66" r="2.2"/>
    <circle class="dot" cx="370" cy="220" r="2.2"/><circle class="dot" cx="480" cy="220" r="2.2"/>
    <g class="chip"><rect class="cf" x="370" y="66" width="135" height="15" rx="3"/><text x="376" y="77" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">PALLET TOWN SNIPER</text></g>
    <text x="376" y="96" font-family="monospace" font-size="8" font-weight="600" fill="var(--illos-mark)" opacity="0.95">PIKACHU PSA 10</text>
    <text x="376" y="110" font-family="monospace" font-size="7.5" font-weight="700" fill="#10b981">+ $42 USDC SPREAD</text>
    <text x="376" y="124" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.75">MARGIN: +12% (PASS)</text>
    <path class="bx" stroke-dasharray="3 3" d="M376 136H474V210H376Z"/>
    <text x="382" y="156" font-family="monospace" font-size="7.5" font-weight="600" fill="var(--illos-mark)" opacity="0.9">PROPOSED SWAP</text>
    <text x="382" y="170" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.75">PSA 10 RWA BARTER</text>
    <text x="382" y="184" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.75">ORACLE: VALIDATED</text>
  </g>
</g>
<g class="r1">
  <g class="box">
    <path class="bx" pathLength="1" d="M370 66H480V220H370Z"/>
    <circle class="dot" cx="370" cy="66" r="2.2"/><circle class="dot" cx="480" cy="66" r="2.2"/>
    <circle class="dot" cx="370" cy="220" r="2.2"/><circle class="dot" cx="480" cy="220" r="2.2"/>
    <g class="chip"><rect class="cf" x="370" y="66" width="135" height="15" rx="3"/><text x="376" y="77" font-family="monospace" font-size="8" font-weight="700" fill="#ffffff">COLLECTIQ COUNTER</text></g>
    <text x="376" y="96" font-family="monospace" font-size="8" font-weight="600" fill="var(--illos-mark)" opacity="0.95">HEIMERDINGER PSA 10</text>
    <text x="376" y="110" font-family="monospace" font-size="7.5" font-weight="700" fill="#10b981">SPREAD BALANCED $0</text>
    <text x="376" y="124" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.75">MARGIN: +10% (ACCEPT)</text>
    <path class="bx" stroke-dasharray="3 3" d="M376 136H474V210H376Z"/>
    <text x="382" y="156" font-family="monospace" font-size="7.5" font-weight="600" fill="var(--illos-mark)" opacity="0.9">ACCEPTED TERMS</text>
    <text x="382" y="170" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.75">ATOMIC TRANSFER</text>
    <text x="382" y="184" font-family="monospace" font-size="7" font-weight="500" fill="var(--illos-mark)" opacity="0.75">ON-CHAIN SETTLED</text>
  </g>
</g><rect class="sh-clock" width="0" height="0"/>
<metadata class="illos-field" data-cycle="4.2"><![CDATA[float rate(float x) {
  float P = 420.0; float b = 0.0;
  for (int j = -1; j <= 3; j++) b += exp(-pow(x - 420.0 - float(j) * P, 2.0) / 2116.0);
  return 70.0 + 36.0 * sin(TAU * 3.0 * x / P + 0.3) + 24.0 * sin(TAU * 7.0 * x / P + 1.0) + 190.0 * b;
}
float field(vec2 p, float t) {
  float X0 = 60.0, X1 = 655.0, FLOOR = 400.0, LIM = 220.0;
  if (p.x < X0 || p.x > X1 || p.y > FLOOR) return 0.0;
  float xx = p.x + 420.0 * t / T;
  float top = FLOOR - rate(xx);
  if (p.y < top) return 0.0;
  if (p.y >= LIM) {
    float flare = top < LIM ? 0.45 * exp(-pow(p.y - LIM, 2.0) / 50.0) : 0.0;
    return 0.42 + 0.5 * (p.y - max(top, LIM)) / (FLOOR - max(top, LIM)) + flare;
  }
  // above the limit: sheared off, breaking into spray that rises and fades. It moves 60 columns and 30 cells a cycle,
  // and its pattern repeats over exactly those, so the loop closes.
  float rise = (LIM - p.y) / (LIM - top + 1.0);
  float spray = step(0.6, hash(vec2(mod(floor(xx / 7.0), 60.0), mod(floor((p.y + 9.4 * 30.0 * t / T) / 9.4), 30.0))));
  return spray * (0.55 - 0.42 * rise);
}]]></metadata>
</svg>`,
};
const LIVE = "<style>.illos-live{position:relative}.illos-live>svg{position:relative}.illos-live .sh-still{visibility:hidden}.illos-field-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}</style>";

/** One Shader illustration, inline, with its live field drawn beneath the SVG. Decorative here. */
function ShaderArt({ name, className, style }: { name: ShaderIllustration; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return undefined;
    const stopPlay = loopInView(ref.current);
    const stopField = mountShader(ref.current);
    return () => {
      stopField();
      stopPlay();
    };
  }, [name]);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx("[&>svg]:h-auto [&>svg]:w-full", className)}
      style={{ "--illos-play": "paused", ...style } as CSSProperties}
      dangerouslySetInnerHTML={{ __html: LIVE + SHADER_SVGS[name] }}
    />
  );
}

/** Loops while a quarter of it is in view, restarting each cycle on the next frame, and pauses off screen. Still for prefers-reduced-motion. */
function loopInView(host: HTMLElement): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const animations = () => host.getAnimations({ subtree: true });
  let visible = false;
  let stopped = false;
  let waiting = false;
  const loop = () => {
    if (waiting || stopped || !visible) return;
    const list = animations();
    if (!list.length) return;
    waiting = true;
    Promise.all(list.map((a) => a.finished)).then(
      () =>
        requestAnimationFrame(() => {
          waiting = false;
          if (stopped || !visible) return;
          for (const a of animations()) a.currentTime = 0; // seek only: play() takes a CSS animation out of CSS control
          loop();
        }),
      () =>
        requestAnimationFrame(() => {
          waiting = false; // an animation was cancelled: pick the loop back up
          loop();
        }),
    );
  };
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      host.style.setProperty("--illos-play", visible ? "running" : "paused");
      loop();
    },
    { threshold: 0.25 },
  );
  io.observe(host);
  return () => {
    stopped = true;
    io.disconnect();
  };
}

// The Shader runtime, inline: it draws each illustration's field on a canvas beneath the SVG.
/**
 * The Shader style's runtime. A Shader SVG carries its field as GLSL in <metadata class="illos-field">;
 * mountShader draws that field on a canvas beneath the SVG in the bar look, taking its time from the SVG's clock
 * animation, so whatever plays, pauses, restarts or holds the SVG's CSS animations drives the field too. Erasable
 * TypeScript only: Node runs this file as is, and the site and the registry ship it as is.
 */

/** Helpers every field may use, and its one uniform, uT (seconds into the cycle). */
const PRELUDE = `precision highp float;
uniform float uT;
const float TAU = 6.2831853;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float blob(vec2 p, vec2 c, float r, float k) { vec2 d = p - c; return k * exp(-dot(d, d) / (r * r)); }
float sm(float a, float b, float t) { return smoothstep(a, b, t); }
float ease(float u) { u = clamp(u, 0.0, 1.0); return u < 0.5 ? 4.0 * u * u * u : 1.0 - pow(-2.0 * u + 2.0, 3.0) / 2.0; }
float seg(vec2 p, vec2 a, vec2 b, float r, float k) { vec2 ab = b - a; float h = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0); vec2 d = p - a - ab * h; return k * exp(-dot(d, d) / (r * r)); }
float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
`;

/**
 * One value per bar cell (columns every 7 px from x = 4, cells on a 9.4 period), with the cell's grain. The field pass
 * and the still's sampler both use it, so the still is the live field's first frame.
 */
const CELL = `
float cellValue(float col, float cell) {
  return field(vec2(4.0 + col * 7.0, cell * 9.4 + 3.5), uT) * (0.7 + 0.3 * hash(vec2(col, cell)));
}`;

/** The field pass: one pixel per cell into a COLS x CELLS texture, the value packed into red (coarse) and green (fine). */
const FIELD_MAIN = `
void main() {
  float v = clamp(cellValue(floor(gl_FragCoord.x), floor(gl_FragCoord.y)) / 4.0, 0.0, 0.99999);
  gl_FragColor = vec4(floor(v * 255.0) / 255.0, fract(v * 255.0), 0.0, 1.0);
}`;

/** The canvas in cells for a frame of w x h: columns every 7 from x = 4 to w - 2, cells of 9.4 down h (720 x 460: 103 x 49). */
const gridFor = (w: number, h: number): [number, number] => [Math.floor((w - 6) / 7) + 1, Math.ceil(h / 9.4)];

/**
 * The bar pass: per pixel, read its cell's value from the field pass and draw the bar look (ink and width by density,
 * screen lines, grid, sparks). Cheap per pixel; the field itself is worked out once per cell, not once per pixel.
 * As it is, it paints the ground too. With CLEAR defined (mountShader) the ground is left clear, so the page, a
 * gradient or a section edge, shows through: the look is painted over black and over white, and how much the two
 * differ is how much ground shows at that pixel.
 */
const BARS = `precision highp float;
uniform vec2 uRes; uniform vec2 uGrid; uniform float uDpr; uniform vec3 uGround; uniform vec3 uInk; uniform sampler2D uField;
uniform vec3 uR1; uniform vec3 uR2; uniform vec3 uR3; uniform vec3 uR4; uniform vec3 uSpark;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 paint(vec3 uGround, vec2 px, float v, float col, float cx, float cell) {
  vec3 color = uGround;
  if (mod(px.x, 96.0) < 1.0 || mod(px.y, 96.0) < 1.0) color = mix(uGround, uInk, 0.09);
  float dx = abs(px.x - cx);
  color = mix(color, mix(uGround, uR4, 0.18), 1.0 - smoothstep(0.3, 0.7, dx));
  float w = 0.0; vec3 c = uR4; float a = 1.0;
  if (v >= 0.72) { w = 3.6; c = uR1; } else if (v >= 0.48) { w = 2.7; c = uR2; } else if (v >= 0.27) { w = 1.8; c = uR3; } else if (v >= 0.1) { w = 1.1; c = uR4; a = 0.55; }
  float bar = step(mod(px.y, 9.4), 7.0) * (1.0 - smoothstep(w * 0.5 - 0.35, w * 0.5 + 0.35, dx)) * step(0.001, w);
  color = mix(color, c, bar * a);
  if (w > 3.5 && hash(vec2(col, cell * 1.3)) > 0.55 && abs(mod(px.y, 9.4) - 3.0) < 0.8 && dx < 0.7) color = uSpark;
  return color;
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  float col = floor((px.x - 4.0) / 7.0 + 0.5);
  float cx = 4.0 + col * 7.0;
  float cell = floor(px.y / 9.4);
  vec4 e = texture2D(uField, (vec2(col, cell) + 0.5) / uGrid);
  float v = (e.r + e.g / 255.0) * 4.0;
  if (col < 0.0 || col > uGrid.x - 1.0) v = 0.0;
#ifdef CLEAR
  vec3 onBlack = paint(vec3(0.0), px, v, col, cx, cell);
  vec3 onWhite = paint(vec3(1.0), px, v, col, cx, cell);
  gl_FragColor = vec4(onBlack, clamp(1.0 - (onWhite.g - onBlack.g), 0.0, 1.0));
#else
  gl_FragColor = vec4(paint(uGround, px, v, col, cx, cell), 1.0);
#endif
}`;

/** The field pass for a field: the prelude, T (the cycle in seconds, which a field may use), the field, one value per cell. */
const fragmentFor = (field: string, cycle: number): string => `${PRELUDE}const float T = ${cycle.toFixed(3)};\n${field}\n${CELL}${FIELD_MAIN}`;

/** The cycle and the field a Shader SVG carries, or null for any other SVG. */
function readField(svg: Element): { cycle: number; field: string } | null {
  const meta = svg.querySelector("metadata.illos-field");
  if (!meta) return null;
  const cycle = Number(meta.getAttribute("data-cycle"));
  const field = (meta.textContent ?? "").trim();
  return cycle > 0 && /float\s+field\s*\(/.test(field) ? { cycle, field } : null;
}

const hex = (value: string, fallback: number[]): number[] => {
  const h = value.trim().replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, "$&$&") : h;
  return /^[0-9a-f]{6}$/i.test(full) ? [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) : fallback;
};

/** The light ramp and spark, used when the page sets no --illos-ramp-*. */
const RAMP = ["#16645a", "#1daf9c", "#3fdec9", "#c2f5ee"].map((c) => hex(c, [0, 0, 0]));
const SPARK = hex("#0b463e", [0, 0, 0]);

let probe: CanvasRenderingContext2D | null | undefined;
const unread = new Set<string>();
/**
 * Any CSS colour a role is set to (hex, rgb(), oklch(), a named colour) as sRGB from 0 to 1, read through a 1 px canvas.
 * A value the browser cannot read gives the fallback, with one console warning per value, never a silent white.
 */
function colour(value: string, fallback: number[]): number[] {
  const v = value.trim();
  if (!v) return fallback;
  const quick = hex(v, []);
  if (quick.length) return quick;
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (probe) {
    probe.fillStyle = "#010203";
    probe.fillStyle = v; // a value the canvas cannot read leaves the marker
    if (probe.fillStyle !== "#010203") {
      probe.clearRect(0, 0, 1, 1);
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return [r! / 255, g! / 255, b! / 255];
    }
  }
  if (!unread.has(v)) {
    unread.add(v);
    console.warn(`Illos: the colour "${v}" could not be read, so the default is used.`);
  }
  return fallback;
}

/**
 * Draws the field of the Shader SVG inside `host` on a canvas beneath it, with a clear ground so the page shows
 * through, and marks the host `illos-live` (CSS then hides the still). Draws a frame whenever the clock's time changed; while the clock is not running it checks every
 * 250 ms, and an `illos:draw` event on the host draws at once (the preview renderer sends it after a seek). Does
 * nothing, and leaves the still, under reduced motion, without a GPU for WebGL, or if the field does not compile. Returns cleanup.
 */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/**
 * A WebGL context only when a GPU draws it, else null. Drawn in software, a field holds the page's main thread every
 * frame, so the still stays instead. The flag catches a blocklisted GPU; the renderer's name catches a software
 * renderer that some browsers still hand out as WebGL.
 */
function hardwareGl(canvas: HTMLCanvasElement, attributes: WebGLContextAttributes = {}): WebGLRenderingContext | null {
  // Asked once per page: on a software renderer each ask waits on the busy GPU process, and fields mount again and again.
  if (software) return null;
  const gl = canvas.getContext("webgl", { ...attributes, failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null;
  if (software === undefined) {
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    software = !gl || Boolean(info && SOFTWARE.test(String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))));
  }
  if (!software) return gl;
  gl?.getExtension("WEBGL_lose_context")?.loseContext();
  return null;
}
let software: boolean | undefined;

function mountShader(host: HTMLElement): () => void {
  const svg = host.querySelector("svg");
  const spec = svg ? readField(svg) : null;
  if (!svg || !spec) return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  const canvas = document.createElement("canvas");
  const gl = hardwareGl(canvas, { antialias: false });
  if (!gl) return () => {};
  const shader = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}");
  const link = (fs: WebGLShader | null) => {
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return null;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "p");
    gl.linkProgram(prog);
    return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
  };
  // The frame comes from the file's viewBox (a 640 x 720 portrait scene as well as the usual 720 x 460).
  const [vw, vh] = (svg.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).slice(2).map(Number);
  const [fw, fh] = vw! > 0 && vh! > 0 ? [vw!, vh!] : [720, 460];
  const [COLS, CELLS] = gridFor(fw, fh);
  const fieldProg = link(shader(gl.FRAGMENT_SHADER, fragmentFor(spec.field, spec.cycle)));
  const barsProg = link(shader(gl.FRAGMENT_SHADER, `#define CLEAR\n${BARS}`));
  if (!fieldProg || !barsProg) return () => {};
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  // The field pass draws into a small texture, one texel per cell; the bar pass reads it.
  const cells = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, cells);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, COLS, CELLS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cells, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const uT = gl.getUniformLocation(fieldProg, "uT");
  const uRes = gl.getUniformLocation(barsProg, "uRes");
  const uGrid = gl.getUniformLocation(barsProg, "uGrid");
  const uDpr = gl.getUniformLocation(barsProg, "uDpr");
  const uInk = gl.getUniformLocation(barsProg, "uInk");
  const uRamp = [1, 2, 3, 4].map((i) => gl.getUniformLocation(barsProg, `uR${i}`));
  const uSpark = gl.getUniformLocation(barsProg, "uSpark");
  const uField = gl.getUniformLocation(barsProg, "uField");

  canvas.className = "illos-field-canvas";
  svg.parentNode?.insertBefore(canvas, svg);
  host.classList.add("illos-live");
  const clock = svg.querySelector(".sh-clock");
  let last = -1;
  let size = "";
  let raf = 0;
  let timer = 0;
  let gone = false;

  // Layout and colours are read at most every half second: a read every frame would force style and layout each frame
  // while the labels animate. A resize or a theme switch shows within half a second.
  let measured = -Infinity;
  let w = 1;
  let h = 1;
  let ink = [0.165, 0.165, 0.165];
  let ramp = RAMP;
  let spark = SPARK;
  const measure = () => {
    const box = svg.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = Math.max(1, Math.round(box.width * dpr));
    h = Math.max(1, Math.round(box.height * dpr));
    const style = getComputedStyle(svg);
    // The page's role first, then the SVG's own fallback, which follows the system theme like the still does.
    const role = (r: string) => style.getPropertyValue(`--illos-${r}`).trim() || style.getPropertyValue(`--_${r}`);
    ink = colour(role("ink"), [0.165, 0.165, 0.165]);
    ramp = RAMP.map((fallback, i) => colour(role(`ramp-${i + 1}`), fallback));
    spark = colour(role("spark"), SPARK);
    measured = Date.now();
  };
  const draw = () => {
    const anim = clock?.getAnimations?.()[0];
    const t = (((Number(anim?.currentTime) || 0) / 1000) % spec.cycle + spec.cycle) % spec.cycle;
    if (Date.now() - measured > 500) measure();
    const look = `${w}x${h} ${ink} ${ramp} ${spark}`; // a resize or a theme switch redraws even while the clock is held
    if (t !== last || look !== size) {
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      size = look;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, COLS, CELLS);
      gl.useProgram(fieldProg);
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(barsProg);
      gl.uniform2f(uRes, fw, fh);
      gl.uniform2f(uGrid, COLS, CELLS);
      gl.uniform1f(uDpr, w / fw);
      gl.uniform3fv(uInk, ink);
      ramp.forEach((c, i) => gl.uniform3fv(uRamp[i]!, c));
      gl.uniform3fv(uSpark, spark);
      gl.bindTexture(gl.TEXTURE_2D, cells);
      gl.uniform1i(uField, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      last = t;
    }
    return anim?.playState === "running";
  };
  // After the clock stops (a cycle ended, or it paused), keep watching every frame for a while: a player restarts a
  // loop a frame later, and the field must follow at once. Then sleep, checking every 250 ms.
  let idle = 0;
  const tick = () => {
    raf = 0;
    timer = 0;
    if (gone) return;
    idle = draw() ? 0 : idle + 1;
    if (idle < 20) raf = requestAnimationFrame(tick);
    else timer = window.setTimeout(tick, 250);
  };
  const now = () => {
    if (!gone) draw();
  };
  const stop = () => {
    if (gone) return; // a late context loss after cleanup must not touch a host another mount now owns
    gone = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    host.removeEventListener("illos:draw", now);
    canvas.remove();
    host.classList.remove("illos-live");
    gl.getExtension("WEBGL_lose_context")?.loseContext(); // free the context now: browsers cap how many are live
  };
  canvas.addEventListener("webglcontextlost", stop);
  host.addEventListener("illos:draw", now);
  tick();
  return stop;
}
