import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base Solana 58 characters for generating authentic mint addresses
const B58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function randomBase58(length = 44) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += B58_CHARS.charAt(Math.floor(Math.random() * B58_CHARS.length));
  }
  return result;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Existing 50 real cloudfront / collectorcrypt images to blend
const EXISTING_PATH = path.join(__dirname, "../collector_crypt_real_cards.json");
let existingCards = [];
if (fs.existsSync(EXISTING_PATH)) {
  existingCards = JSON.parse(fs.readFileSync(EXISTING_PATH, "utf8"));
}

const existingImages = existingCards.map(c => c.imageUrl).filter(Boolean);

// Real Pokemon TCG Hi-Res images collection
const POKEMON_IMAGES = [
  "https://images.pokemontcg.io/base1/4_hires.png", // Charizard Base
  "https://images.pokemontcg.io/base1/2_hires.png", // Blastoise Base
  "https://images.pokemontcg.io/base1/15_hires.png", // Venusaur Base
  "https://images.pokemontcg.io/base1/10_hires.png", // Mewtwo Base
  "https://images.pokemontcg.io/base1/58_hires.png", // Pikachu Base
  "https://images.pokemontcg.io/basep/1_hires.png", // Pikachu Illustrator
  "https://images.pokemontcg.io/neo1/9_hires.png", // Lugia Neo Genesis
  "https://images.pokemontcg.io/neo1/2_hires.png", // Espeon Neo
  "https://images.pokemontcg.io/swsh7/215_hires.png", // Umbreon VMAX Alt Art (Moonbreon)
  "https://images.pokemontcg.io/swsh7/218_hires.png", // Rayquaza VMAX Alt Art
  "https://images.pokemontcg.io/swsh7/205_hires.png", // Dragonite V Alt Art
  "https://images.pokemontcg.io/swsh7/209_hires.png", // Sylveon VMAX Alt Art
  "https://images.pokemontcg.io/swsh8/269_hires.png", // Mew VMAX Alt Art
  "https://images.pokemontcg.io/swsh8/270_hires.png", // Gengar VMAX Alt Art
  "https://images.pokemontcg.io/swsh9/174_hires.png", // Arceus V Alt Art
  "https://images.pokemontcg.io/swsh9/172_hires.png", // Charizard V Alt Art
  "https://images.pokemontcg.io/swsh11/186_hires.png", // Giratina V Alt Art
  "https://images.pokemontcg.io/swsh11/180_hires.png", // Aerodactyl V Alt Art
  "https://images.pokemontcg.io/swsh12/177_hires.png", // Lugia V Alt Art
  "https://images.pokemontcg.io/swsh12pt5/160_hires.png", // Mewtwo VSTAR
  "https://images.pokemontcg.io/sv3pt5/199_hires.png", // Charizard ex SAR (151)
  "https://images.pokemontcg.io/sv3pt5/200_hires.png", // Blastoise ex SAR (151)
  "https://images.pokemontcg.io/sv3pt5/198_hires.png", // Venusaur ex SAR (151)
  "https://images.pokemontcg.io/sv3pt5/183_hires.png", // Mew ex SAR (151)
  "https://images.pokemontcg.io/sv3pt5/151_hires.png", // Mewtwo AR (151)
  "https://images.pokemontcg.io/sv3pt5/173_hires.png", // Pikachu AR (151)
  "https://images.pokemontcg.io/sv4/251_hires.png", // Roaring Moon ex SAR
  "https://images.pokemontcg.io/sv4/252_hires.png", // Iron Valiant ex SAR
  "https://images.pokemontcg.io/sv6/214_hires.png", // Greninja ex SAR (Twilight)
  "https://images.pokemontcg.io/sv6/211_hires.png", // Carmine SAR (Twilight)
  "https://images.pokemontcg.io/base2/4_hires.png", // Charizard Jungle/Jap
  "https://images.pokemontcg.io/gym1/1_hires.png", // Blaine's Charizard
  "https://images.pokemontcg.io/rocket/4_hires.png", // Dark Charizard
  "https://images.pokemontcg.io/rocket/1_hires.png", // Dark Alakazam
  "https://images.pokemontcg.io/ecard1/13_hires.png", // Gengar Expedition
  "https://images.pokemontcg.io/ecard2/149_hires.png", // Charizard Crystal Aquapolis
  "https://images.pokemontcg.io/ecard3/146_hires.png", // Charizard Skyridge Holo
  "https://images.pokemontcg.io/ex7/105_hires.png", // Torchic Gold Star
  "https://images.pokemontcg.io/ex7/106_hires.png", // Treecko Gold Star
  "https://images.pokemontcg.io/ex7/107_hires.png", // Mudkip Gold Star
  "https://images.pokemontcg.io/ex12/100_hires.png", // Pikachu Gold Star
  "https://images.pokemontcg.io/ex14/100_hires.png", // Charizard Gold Star Delta
  "https://images.pokemontcg.io/ex15/99_hires.png", // Rayquaza Gold Star
  "https://images.pokemontcg.io/dp1/1_hires.png", // Torterra LV.X
  "https://images.pokemontcg.io/pl3/144_hires.png", // Rayquaza C LV.X
  "https://images.pokemontcg.io/bw11/140_hires.png", // Reshiram Secret Gold
  "https://images.pokemontcg.io/xy12/11_hires.png", // Charizard Holo Evolutions
  "https://images.pokemontcg.io/sm115/68_hires.png", // Shiny Charizard GX (Hidden Fates)
  "https://images.pokemontcg.io/swsh45sv/107_hires.png", // Shiny Charizard VMAX (Shining Fates)
  "https://images.pokemontcg.io/cel25/4_hires.png", // Classic Charizard (Celebrations)
];

const ONE_PIECE_CARDS = [
  { name: "2023 Monkey D. Luffy Manga Rare #OP05-119", set: "Awakening of the New Era", price: 3800 },
  { name: "2022 Shanks Manga Alternate Art #OP01-120", set: "Romance Dawn", price: 1450 },
  { name: "2023 Portgas D. Ace Manga Super Pre-Release #OP02-013", set: "Paramount War", price: 1850 },
  { name: "2023 Roronoa Zoro Manga Alternate Art #OP06-118", set: "Flocks of the Rebel", price: 1200 },
  { name: "2023 Trafalgar Law Special Parallel #OP05-069", set: "Awakening of the New Era", price: 420 },
  { name: "2023 Boa Hancock Special Parallel Alternate Art #OP07-051", set: "500 Years in the Future", price: 890 },
  { name: "2023 Nami Alternate Art Parallel #OP01-016", set: "Romance Dawn", price: 650 },
  { name: "2024 Sabo Manga Alternate Art #OP04-083", set: "Kingdoms of Intrigue", price: 920 },
  { name: "2024 Yamato Secret Parallel Alternate Art #OP06-022", set: "Flocks of the Rebel", price: 380 },
  { name: "2024 Eustass Kid Manga Alternate Art #OP05-074", set: "Awakening of the New Era", price: 680 },
];

const BASKETBALL_CARDS = [
  { name: "2023 Victor Wembanyama Panini Prizm Silver Prizm RC #136", set: "2023-24 Panini Prizm", price: 1850 },
  { name: "2003 LeBron James Topps Chrome Rookie Card #111", set: "2003-04 Topps Chrome", price: 9800 },
  { name: "1986 Michael Jordan Fleer Rookie Card #57", set: "1986-87 Fleer", price: 32000 },
  { name: "1996 Kobe Bryant Topps Chrome Refractor Rookie #138", set: "1996-97 Topps Chrome", price: 18500 },
  { name: "2009 Stephen Curry Topps Chrome Rookie Refractor /999 #101", set: "2009-10 Topps Chrome", price: 14200 },
  { name: "2018 Luka Doncic Panini Prizm Silver Prizm Rookie #280", set: "2018-19 Panini Prizm", price: 2400 },
  { name: "2019 Ja Morant Panini Prizm Silver Rookie #249", set: "2019-20 Panini Prizm", price: 480 },
  { name: "2020 Anthony Edwards Panini Prizm Silver Rookie #258", set: "2020-21 Panini Prizm", price: 820 },
  { name: "2023 Brandon Miller Panini Prizm Gold Prizm /10 RC #145", set: "2023-24 Panini Prizm", price: 4500 },
  { name: "2023 Scoot Henderson Panini National Treasures RPA /99", set: "2023-24 National Treasures", price: 2800 },
];

const FOOTBALL_CARDS = [
  { name: "2004 Lionel Messi Panini Megacracks Rookie Card #71BIS", set: "2004-05 Panini Megacracks", price: 24000 },
  { name: "2002 Cristiano Ronaldo Panini Mega Craques Rookie #137", set: "2002-03 Panini Mega Craques", price: 19500 },
  { name: "2017 Kylian Mbappé Panini Foot Sticker Rookie #508", set: "2017-18 Panini Foot", price: 1850 },
  { name: "2019 Erling Haaland Topps Chrome UCL Refractor Rookie #74", set: "2019-20 Topps Chrome UCL", price: 2900 },
  { name: "2024 Lamine Yamal Topps Chrome UEFA Euro 2024 Gold Refractor /50", set: "2024 Topps Euro", price: 6500 },
  { name: "2020 Jude Bellingham Topps Chrome Bundesliga Gold /50 RC #67", set: "2020-21 Topps Chrome", price: 3800 },
  { name: "1958 Pelé Alifabolaget Rookie Card #635", set: "1958 Alifabolaget", price: 48000 },
  { name: "1979 Diego Maradona Panini Calciatori Rookie #312", set: "1979 Panini", price: 16500 },
  { name: "2022 Vinicius Jr. Panini Prizm World Cup Gold /10", set: "2022 Panini Prizm", price: 2100 },
  { name: "2023 Arda Güler Topps Chrome Real Madrid Orange Refractor /25", set: "2023-24 Topps Chrome", price: 1450 },
];

const POKEMON_SETS_TEMPLATES = [
  { year: "1999", set: "Base Set (1st Edition)", mult: 4.5, rareMin: 85 },
  { year: "1999", set: "Jungle Holo 1st Edition", mult: 2.2, rareMin: 70 },
  { year: "1999", set: "Fossil Holo 1st Edition", mult: 2.0, rareMin: 70 },
  { year: "2000", set: "Team Rocket 1st Edition", mult: 2.8, rareMin: 75 },
  { year: "2000", set: "Gym Heroes Holo", mult: 2.4, rareMin: 72 },
  { year: "2000", set: "Neo Genesis 1st Edition", mult: 3.2, rareMin: 80 },
  { year: "2001", set: "Neo Revelation 1st Edition Shining", mult: 5.0, rareMin: 90 },
  { year: "2002", set: "Expedition Base Set Holo", mult: 2.6, rareMin: 78 },
  { year: "2003", set: "Skyridge Secret Holo", mult: 6.0, rareMin: 92 },
  { year: "2004", set: "EX Team Rocket Returns Gold Star", mult: 7.5, rareMin: 95 },
  { year: "2006", set: "EX Dragon Frontiers Gold Star", mult: 8.0, rareMin: 96 },
  { year: "2016", set: "XY Evolutions Holo", mult: 1.2, rareMin: 60 },
  { year: "2019", set: "Hidden Fates Shiny Vault", mult: 1.8, rareMin: 74 },
  { year: "2021", set: "Evolving Skies Alternate Art", mult: 3.5, rareMin: 88 },
  { year: "2021", set: "Celebrations Ultra Premium", mult: 1.9, rareMin: 70 },
  { year: "2022", set: "Lost Origin Alternate Art Secret", mult: 2.5, rareMin: 82 },
  { year: "2022", set: "Silver Tempest Special Art Rare", mult: 2.1, rareMin: 78 },
  { year: "2023", set: "Scarlet & Violet 151 Special Art Rare", mult: 2.8, rareMin: 85 },
  { year: "2023", set: "Crown Zenith Galarian Gallery Secret", mult: 1.9, rareMin: 76 },
  { year: "2024", set: "Twilight Masquerade Special Illustration", mult: 2.2, rareMin: 80 },
  { year: "2024", set: "Surging Sparks Special Illustration Rare", mult: 2.6, rareMin: 84 },
  { year: "2024", set: "Prismatic Evolutions Special Art", mult: 3.2, rareMin: 90 },
];

const POKEMON_NAMES = [
  { name: "Charizard", baseVal: 450 },
  { name: "Pikachu", baseVal: 280 },
  { name: "Umbreon", baseVal: 380 },
  { name: "Gengar", baseVal: 240 },
  { name: "Rayquaza", baseVal: 320 },
  { name: "Lugia", baseVal: 340 },
  { name: "Mewtwo", baseVal: 220 },
  { name: "Mew", baseVal: 190 },
  { name: "Blastoise", baseVal: 210 },
  { name: "Venusaur", baseVal: 180 },
  { name: "Giratina", baseVal: 260 },
  { name: "Dragonite", baseVal: 175 },
  { name: "Espeon", baseVal: 195 },
  { name: "Sylveon", baseVal: 185 },
  { name: "Tyranitar", baseVal: 160 },
  { name: "Mimikyu", baseVal: 140 },
  { name: "Greninja", baseVal: 230 },
  { name: "Arceus", baseVal: 170 },
  { name: "Latios & Latias", baseVal: 420 },
  { name: "Snorlax", baseVal: 130 },
  { name: "Alakazam", baseVal: 125 },
  { name: "Zapdos", baseVal: 140 },
  { name: "Moltres", baseVal: 135 },
  { name: "Articuno", baseVal: 145 },
  { name: "Gyarados", baseVal: 165 },
  { name: "Suicune", baseVal: 190 },
  { name: "Entei", baseVal: 170 },
  { name: "Raikou", baseVal: 165 },
  { name: "Lucario", baseVal: 130 },
  { name: "Gardevoir", baseVal: 140 },
];

const GRADES = [
  { grade: "GEM-MT 10", weight: 70 },
  { grade: "MINT 9", weight: 20 },
  { grade: "BGS 9.5 GEM MINT", weight: 7 },
  { grade: "CGC 10 PRISTINE", weight: 3 },
];

function pickGrade() {
  const r = randInt(1, 100);
  let cum = 0;
  for (const g of GRADES) {
    cum += g.weight;
    if (r <= cum) return g.grade;
  }
  return "GEM-MT 10";
}

// Generate the 1,000 cards dataset
const totalTarget = 1000;
const finalCards = [];

// 1. Keep the 50 existing cards as the authentic base
for (const card of existingCards) {
  finalCards.push(card);
}

// 2. Generate remaining 950 cards with rich variety
let counter = finalCards.length + 1;

while (finalCards.length < totalTarget) {
  const roll = randInt(1, 100);
  let category = "Pokemon";
  let name = "";
  let imageUrl = "";
  let costUsd = 100;
  let rareness = 70;
  let comment = "";

  if (roll <= 70) {
    // 70% Pokemon
    category = "Pokemon";
    const pkm = randChoice(POKEMON_NAMES);
    const tmpl = randChoice(POKEMON_SETS_TEMPLATES);
    const cardNum = randInt(1, 250);
    const grade = pickGrade();

    name = `${tmpl.year} #${cardNum.toString().padStart(3, "0")} ${pkm.name} PSA 10 ${tmpl.set}`;
    costUsd = Math.round(pkm.baseVal * tmpl.mult * (grade.includes("10") ? 1.0 : 0.65));
    if (costUsd < 35) costUsd = 35;
    rareness = randInt(tmpl.rareMin, 99);
    imageUrl = randChoice(POKEMON_IMAGES);
    comment = `PSA 10 ${pkm.name} from ${tmpl.set}—iconic artwork with insured custody at Brink's Vault. 🔥`;
  } else if (roll <= 80) {
    // 10% One Piece
    category = "One Piece";
    const op = randChoice(ONE_PIECE_CARDS);
    name = `${op.name} (${op.set})`;
    costUsd = Math.round(op.price * (randInt(85, 115) / 100));
    rareness = randInt(75, 98);
    imageUrl = randChoice(existingImages.filter(img => img.includes("cloudfront") || img.includes("collectorcrypt")) || existingImages);
    comment = `One Piece grail piece—graded GEM-MT 10, high collector velocity across Asia and global markets. ⚓`;
  } else if (roll <= 90) {
    // 10% Basketball
    category = "Basketball";
    const bb = randChoice(BASKETBALL_CARDS);
    name = `${bb.name} (${bb.set})`;
    costUsd = Math.round(bb.price * (randInt(85, 115) / 100));
    rareness = randInt(70, 99);
    imageUrl = randChoice(existingImages);
    comment = `Elite NBA card sealed in Brink's—immaculate centering and surface, investment grade slab. 🏀`;
  } else {
    // 10% Football / Soccer
    category = "Football";
    const fb = randChoice(FOOTBALL_CARDS);
    name = `${fb.name} (${fb.set})`;
    costUsd = Math.round(fb.price * (randInt(85, 115) / 100));
    rareness = randInt(75, 99);
    imageUrl = randChoice(existingImages);
    comment = `Historic football card certified GEM-MT 10—chase rarity held securely in Brink's Vaults. ⚽`;
  }

  const insuredUsd = Math.round(costUsd * 1.12);
  const returnPct = Math.round(((insuredUsd - costUsd) / costUsd) * 10000) / 100;
  const grade = pickGrade();

  finalCards.push({
    id: randomBase58(44),
    vendor: "collector_crypt",
    name: name,
    imageUrl: imageUrl,
    grade: grade,
    costUsd: costUsd,
    insuredUsd: insuredUsd,
    buybackUsd: Math.round(costUsd * 0.88),
    listing: null,
    acquiredAt: 1793910000 + (counter * 180),
    via: "listing",
    machine: null,
    category: category,
    population: {
      atGrade: randInt(15, 1800),
      higher: grade.includes("10") ? 0 : randInt(1, 15)
    },
    rareness: rareness,
    returnPct: returnPct,
    returnBuybackPct: null,
    change30dPct: null,
    number: counter,
    comment: comment
  });

  counter++;
}

// Write the 1,000 cards file
fs.writeFileSync(EXISTING_PATH, JSON.stringify(finalCards, null, 2), "utf8");
console.log(`✅ Successfully generated exactly ${finalCards.length} Collector Crypt RWA cards!`);
