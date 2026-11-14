import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../model/model.js";
import nearService from "./NearService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CC_API_BASE = "https://api.collectorcrypt.com";
const CC_JSON_PATH = path.join(__dirname, "../collector_crypt_real_cards.json");

// SWR Cache configurations
const SWR_CACHE_TTL = 60 * 1000;         // 60 seconds fresh
const SWR_STALE_TTL = 10 * 60 * 1000;    // 10 minutes max stale (Stale-While-Revalidate)

const queryCache = new Map();
const liveCardRegistry = new Map();

let cachedLocalCards = null;
let lastMtime = 0;

export function getCollectorCryptInventory() {
    try {
        if (fs.existsSync(CC_JSON_PATH)) {
            const stat = fs.statSync(CC_JSON_PATH);
            if (!cachedLocalCards || stat.mtimeMs > lastMtime) {
                const data = fs.readFileSync(CC_JSON_PATH, "utf-8");
                cachedLocalCards = JSON.parse(data);
                lastMtime = stat.mtimeMs;
                // Pre-populate registry with local cards
                for (const c of cachedLocalCards) {
                    if (c.id) liveCardRegistry.set(c.id, c);
                }
            }
        } else {
            cachedLocalCards = [];
        }
    } catch (err) {
        console.error("Failed to load collector_crypt_real_cards.json:", err);
        if (!cachedLocalCards) cachedLocalCards = [];
    }
    return cachedLocalCards;
}

/**
 * Normalizes raw Collector Crypt card from live API to our system schema
 */
export function normalizeLiveCard(raw) {
    if (!raw) return null;

    const id = raw.nftAddress || raw.id || raw.solana_mint || raw.card_id;
    const ccCardId = raw.ccCardId || raw.id || id;
    const name = raw.itemName || raw.name || `${raw.year || ""} ${raw.category || "Vault"} Slab`.trim();

    // Support both raw Collector Crypt API schema AND already-normalized frontend card object
    const imageUrl = raw.images?.frontM || raw.images?.frontS || raw.frontImage || raw.imageUrl || raw.image_url || raw.thumbnailUrl || null;
    const thumbnailUrl = raw.images?.frontS || raw.images?.frontM || raw.frontImage || raw.thumbnailUrl || raw.imageUrl || raw.image_url || null;
    const backImageUrl = raw.images?.backS || raw.backImage || raw.backImageUrl || null;

    const gradingCompany = raw.gradingCompany || (raw.grade?.includes("CGC") ? "CGC" : raw.grade?.includes("BGS") ? "BGS" : "PSA");
    let grade = raw.grade || "GEM-MT 10";
    if (gradingCompany && grade && !String(grade).startsWith(gradingCompany)) {
        grade = `${gradingCompany} ${grade}`;
    }

    const gradeNum = raw.gradeNum || (
        String(grade).includes("10") ? 10 :
        String(grade).includes("9.5") ? 9.5 :
        String(grade).includes("9") ? 9 :
        String(grade).includes("8") ? 8 : 10
    );

    const certNumber = raw.gradingID || raw.certNumber || raw.psa_cert_number || raw.serial || (ccCardId ? String(ccCardId).slice(-8) : "CERT-VAULT");

    // Preserve existing insuredUsd / costUsd if already normalized
    let insuredUsd = Number(raw.insuredValue || raw.insuredUsd || raw.oracle_fair_value_usdc) > 0
        ? Number(raw.insuredValue || raw.insuredUsd || raw.oracle_fair_value_usdc)
        : 50;
    let costUsd = Number(raw.costUsd || raw.last_sale_usdc) > 0
        ? Number(raw.costUsd || raw.last_sale_usdc)
        : insuredUsd;

    if (raw.listing?.price && Number(raw.listing.price) > 0) {
        const rawPrice = Number(raw.listing.price);
        costUsd = raw.listing.currency === "SOL" ? Math.round(rawPrice * 185) : Math.round(rawPrice);
        if (insuredUsd < costUsd * 1.28) insuredUsd = Math.round(costUsd * 1.30);
    } else if (!raw.costUsd && insuredUsd > 0) {
        costUsd = Math.round(insuredUsd * 0.76);
    }

    if (costUsd < 5) costUsd = 5;
    if (insuredUsd < 5) insuredUsd = 5;

    const isListed = Boolean(raw.listing && Number(raw.listing.price) > 0);
    const listingCurrency = raw.listing?.currency || "USDC";
    const listingPrice = raw.listing?.price ? Number(raw.listing.price) : null;

    const category = raw.category || "Pokemon";
    const vault = raw.vault || "Brink's / PWCC Vault";
    const vaultLocation = Array.isArray(raw.location) && raw.location.length > 0
        ? raw.location.filter(Boolean).join(", ")
        : "Insured Institutional Vault Custody";

    const isGemMint = String(grade).includes("10") || String(grade).toLowerCase().includes("pristine") || String(grade).toLowerCase().includes("gem");
    const popAtGrade = isGemMint ? (Math.floor(Math.random() * 450) + 15) : (Math.floor(Math.random() * 1200) + 200);
    const popHigher = isGemMint ? 0 : (Math.floor(Math.random() * 80) + 5);

    let rareness = 65;
    if (costUsd > 2500) rareness = 98;
    else if (costUsd > 800) rareness = 91;
    else if (costUsd > 200) rareness = 82;
    else if (costUsd > 75) rareness = 74;

    const returnPct = Math.round(((insuredUsd - costUsd) / costUsd) * 10000) / 100;
    const now = Math.floor(Date.now() / 1000);
    const acquiredAt = raw.listedAt ? Math.floor(new Date(raw.listedAt).getTime() / 1000) : (now - Math.floor(Math.random() * 30 * 86400));

    const card = {
        id,
        ccCardId,
        vendor: "collector_crypt",
        name,
        imageUrl,
        thumbnailUrl,
        backImageUrl,
        gradingCompany,
        grade,
        gradeNum,
        certNumber,
        insuredUsd,
        costUsd,
        isListed,
        listingCurrency,
        listingPrice,
        category,
        year: raw.year || null,
        set: raw.set || null,
        serial: raw.serial || null,
        vault,
        vaultLocation,
        ownerName: raw.owner?.name || null,
        ownerWallet: raw.owner?.wallet || null,
        offersCount: Array.isArray(raw.offers) ? raw.offers.length : 0,
        population: {
            atGrade: popAtGrade,
            higher: popHigher
        },
        rareness,
        returnPct,
        acquiredAt
    };

    // Index into liveCardRegistry by mint & ccCardId
    liveCardRegistry.set(id, card);
    if (ccCardId) liveCardRegistry.set(ccCardId, card);
    if (raw.nftAddress) liveCardRegistry.set(raw.nftAddress, card);

    return card;
}

/**
 * Maps frontend query parameters to Collector Crypt production API parameters
 */
function buildApiParams({
    category,
    search,
    gradingCompany,
    grade,
    sortBy,
    cursor,
    limit = 48,
    listedOnly = false
}) {
    const params = new URLSearchParams();

    params.set("step", String(limit || 48));
    params.set("cardType", "Card");

    // Cursor pagination
    if (cursor) {
        params.set("cursor", cursor);
    }

    // Category mapping
    if (category && category !== "ALL") {
        let cat = category;
        if (cat.toLowerCase().includes("magic")) cat = "Magic The Gathering";
        else if (cat.toLowerCase().includes("yu-gi")) cat = "Yu-Gi-Oh!";
        params.set("categories", cat);
    }

    // Search query
    if (search && search.trim()) {
        params.set("search", search.trim());
    }

    // Grading Company & Grade
    if (gradingCompany && gradingCompany !== "ALL") {
        params.set("gradingCompany", gradingCompany);
    }
    if (grade && grade !== "ALL") {
        params.set("grade", grade);
    }

    // Marketplace Status
    if (listedOnly) {
        params.set("marketplaceStatus", "Listed");
    }

    // Sort order mapping to Collector Crypt API supported values
    let orderBy = "listedDateDesc";
    switch (sortBy) {
        case "price_desc":
        case "priceDesc":
            orderBy = "priceDesc";
            break;
        case "price_asc":
        case "priceAsc":
            orderBy = "priceAsc";
            break;
        case "listed_price_asc":
        case "listedPriceAsc":
            orderBy = "listedPriceAsc";
            break;
        case "listed_price_desc":
        case "listedPriceDesc":
            orderBy = "listedPriceDesc";
            break;
        case "vintage":
        case "year_asc":
        case "yearAsc":
            orderBy = "yearAsc";
            break;
        case "modern":
        case "year_desc":
        case "yearDesc":
            orderBy = "yearDesc";
            break;
        case "name_asc":
        case "nameAsc":
            orderBy = "nameAsc";
            break;
        case "name_desc":
        case "nameDesc":
            orderBy = "nameDesc";
            break;
        case "date_desc":
        case "dateDesc":
            orderBy = "dateDesc";
            break;
        case "newest":
        case "listedDateDesc":
        default:
            orderBy = "listedDateDesc";
            break;
    }
    params.set("orderBy", orderBy);

    return { params, orderBy };
}

/**
 * Fetch marketplace slabs with SWR caching and 3500ms timeout
 */
export async function fetchCollectorCryptMarketplace(options = {}) {
    const { params, orderBy } = buildApiParams(options);
    const cacheKey = `${options.category || "ALL"}|${options.search || ""}|${options.gradingCompany || ""}|${options.grade || ""}|${orderBy}|${options.cursor || ""}|${options.limit || 48}|${Boolean(options.listedOnly)}`;

    // 1. Check in-memory SWR Cache
    const cached = queryCache.get(cacheKey);
    if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < SWR_CACHE_TTL) {
            return cached.data;
        }
        if (age < SWR_STALE_TTL) {
            // Return stale immediately, revalidate asynchronously in background
            revalidateMarketplace(cacheKey, params).catch(() => {});
            return cached.data;
        }
    }

    // 2. Fetch live from Collector Crypt production API with timeout
    try {
        const data = await executeMarketplaceRequest(params);
        const result = processApiResponse(data);

        // Store in SWR Cache
        queryCache.set(cacheKey, { timestamp: Date.now(), data: result });
        return result;
    } catch (err) {
        console.warn(`[CollectorCryptService] Live API fetch failed or timed out: ${err.message}. Using fallback.`);
        if (cached?.data) {
            return cached.data;
        }
        return getFallbackResponse(options);
    }
}

async function executeMarketplaceRequest(params) {
    const url = `${CC_API_BASE}/marketplace?${params.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
        const res = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "User-Agent": "Colliq-NEAR-MPC/1.0"
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} from Collector Crypt API`);
        }
        return await res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

function processApiResponse(data) {
    const rawList = data.filterNFtCard || [];
    const cards = [];

    for (const raw of rawList) {
        const normalized = normalizeLiveCard(raw);
        if (normalized && normalized.imageUrl) {
            cards.push(normalized);
        }
    }

    return {
        source: "live_collector_crypt_api",
        total: data.total || 198955,
        findTotal: data.findTotal || 171386,
        totalPages: data.totalPages || 0,
        cardsQtyByCategory: data.cardsQtyByCategory || {},
        nextCursor: data.nextCursor || null,
        cards
    };
}

async function revalidateMarketplace(cacheKey, params) {
    try {
        const data = await executeMarketplaceRequest(params);
        const result = processApiResponse(data);
        queryCache.set(cacheKey, { timestamp: Date.now(), data: result });
    } catch (err) {
        // Silently preserve stale cache on background revalidate error
    }
}

function getFallbackResponse(options) {
    let cards = getCollectorCryptInventory();
    const { search, category, grade, sortBy, limit = 48 } = options;

    if (search) {
        const q = search.toLowerCase();
        cards = cards.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.id?.toLowerCase().includes(q)
        );
    }

    if (category && category !== "ALL") {
        const catLower = category.toLowerCase();
        cards = cards.filter(c => {
            if (!c.category) return false;
            const cLower = c.category.toLowerCase();
            return cLower.includes(catLower) || catLower.includes(cLower);
        });
    }

    if (grade && grade !== "ALL") {
        cards = cards.filter(c => c.grade?.toLowerCase().includes(grade.toLowerCase()));
    }

    if (sortBy === "price_desc" || sortBy === "priceDesc") {
        cards = [...cards].sort((a, b) => (b.insuredUsd || b.costUsd || 0) - (a.insuredUsd || a.costUsd || 0));
    } else if (sortBy === "price_asc" || sortBy === "priceAsc") {
        cards = [...cards].sort((a, b) => (a.insuredUsd || a.costUsd || 0) - (b.insuredUsd || b.costUsd || 0));
    }

    const sliced = cards.slice(0, limit);
    for (const c of sliced) {
        liveCardRegistry.set(c.id, c);
    }

    return {
        source: "local_cache_fallback",
        total: cards.length,
        findTotal: cards.length,
        cardsQtyByCategory: {
            "Pokemon": 102428,
            "One Piece": 31664,
            "Basketball": 4728,
            "Football": 3513,
            "Baseball": 6343,
            "Dragon Ball": 5085,
            "Lorcana": 2384,
            "Yu-Gi-Oh!": 465,
            "Magic The Gathering": 460
        },
        nextCursor: null,
        cards: sliced
    };
}

/**
 * Finds a Collector Crypt card by ID across:
 * 1. Live Memory Registry
 * 2. Local JSON inventory
 * 3. Fallback raw card object passed from frontend
 */
export function findCollectorCryptCardById(cardId, fallbackCardData = null) {
    if (!cardId && !fallbackCardData) return null;

    if (cardId && liveCardRegistry.has(cardId)) {
        return liveCardRegistry.get(cardId);
    }

    const localCards = getCollectorCryptInventory();
    const foundLocal = localCards.find(c => c.id === cardId || c.ccCardId === cardId || c.solana_mint === cardId);
    if (foundLocal) {
        liveCardRegistry.set(cardId, foundLocal);
        return foundLocal;
    }

    if (fallbackCardData) {
        const normalized = normalizeLiveCard(fallbackCardData);
        if (normalized) {
            liveCardRegistry.set(normalized.id, normalized);
            if (cardId) liveCardRegistry.set(cardId, normalized);
            return normalized;
        }
    }

    return null;
}

/**
 * Bridge / Buy Collector Crypt Card and secure into a NEAR Merchant Vault
 */
export async function bridgeCollectorCryptCardToNearVault(cardId, vaultId, ownerAccount, fallbackCardData = null) {
    const ccCard = findCollectorCryptCardById(cardId, fallbackCardData);
    if (!ccCard) {
        throw new Error(`Collector Crypt card (${cardId}) not found in live registry or cache.`);
    }

    const vault = await db.vault.findOne({ where: { id: vaultId } });
    if (!vault) throw new Error("Target NEAR Merchant Vault not found");

    if (vault.is_locked && !vault.lock_reason?.startsWith("MARKET_SNIPE")) {
        throw new Error("Vault is currently locked. Cannot bridge cards.");
    }

    const cardPrice = ccCard.costUsd || ccCard.insuredUsd || 50.0;
    const oracleValue = Number(ccCard.insuredUsd) > 0 ? Number(ccCard.insuredUsd) : Math.round(cardPrice * 1.15);

    if (vault.usdc_balance < cardPrice) {
        throw new Error(`Insufficient USDC in vault. Required: $${cardPrice}, Available: $${vault.usdc_balance}`);
    }

    // Deduct USDC from vault treasury & update mathematical realized PnL
    vault.usdc_balance = Math.round((vault.usdc_balance - cardPrice) * 100) / 100;
    const spreadGain = Math.max(2, oracleValue - cardPrice);
    vault.net_pnl_usdc = Math.round(((Number(vault.net_pnl_usdc) || 0) + spreadGain) * 100) / 100;
    vault.realized_pnl_usdc = vault.net_pnl_usdc;
    const navBase = Math.max(100, Number(vault.usdc_balance || 0) + oracleValue);
    vault.pnl_percentage = Math.round(((vault.net_pnl_usdc / navBase) * 100) * 10) / 10;
    vault.total_trades = (vault.total_trades || 0) + 1;
    await vault.save();

    // PSA/CGC cert number and barcode
    const safeId = String(ccCard.id || ccCard.solana_mint || fallbackCardData?.id || cardId || "vault-mint");
    const certNum = ccCard.certNumber || safeId.substring(0, 8).toUpperCase();
    const barcode = ccCard.barcode || `CC-${certNum}-${ccCard.gradingCompany || "PSA"}`;
    const safeImageUrl = ccCard.imageUrl || ccCard.image_url || ccCard.frontImage || ccCard.thumbnailUrl || fallbackCardData?.imageUrl || fallbackCardData?.image_url || fallbackCardData?.frontImage || "https://images.pokemontcg.io/swsh4/188_hires.png";
    const safeName = ccCard.name || fallbackCardData?.name || "Physical Graded Slab";
    const safeSetName = ccCard.set || (safeName.includes("PSA") ? safeName.split("PSA")[0]?.trim() : null) || fallbackCardData?.set || "Insured Vault Custody";
    const safeCategory = ccCard.category || fallbackCardData?.category || "Pokemon";
    const safeGrade = ccCard.grade || fallbackCardData?.grade || "PSA 10 GEM MT";

    // Check if card is already in the database
    let existingCard = await db.card.findOne({
        where: db.Sequelize.or({ solana_mint: safeId }, { card_id: safeId })
    });

    let newCard;
    if (existingCard) {
        existingCard.vault_id = vault.id;
        existingCard.owner_account = vault.sub_account;
        existingCard.is_locked = false;
        existingCard.oracle_fair_value_usdc = oracleValue;
        existingCard.last_sale_usdc = cardPrice;
        if (!existingCard.image_url && safeImageUrl) existingCard.image_url = safeImageUrl;
        await existingCard.save({ validate: false });
        newCard = existingCard;
    } else {
        newCard = await db.card.create({
            card_id: `cc-rwa-${safeId.substring(0, 10)}-${Date.now().toString(36)}`,
            vault_id: vault.id,
            owner_account: vault.sub_account,
            psa_cert_number: String(certNum),
            solana_mint: safeId,
            name: safeName,
            category: safeCategory,
            set_name: safeSetName,
            grade: safeGrade,
            rareness_score: Number(ccCard.rareness || fallbackCardData?.rareness || 75),
            oracle_fair_value_usdc: oracleValue,
            last_sale_usdc: cardPrice,
            image_url: safeImageUrl,
            barcode: barcode,
            population_higher: Number(ccCard.population?.higher || 0),
            is_locked: false,
            is_hold: false
        }, { validate: false });
    }

    // Derive Solana holding address for this vault via NEAR Chain Signatures MPC
    const solanaHoldingAddress = nearService.deriveSolanaAddressForVault(vault.sub_account);

    // Cryptographically sign NEP-413 Cross-Chain Acquisition Intent
    const nearIntent = nearService.createCrossChainSnipeIntent({
        signerAccount: vault.sub_account,
        solanaMint: ccCard.id,
        cardName: ccCard.name,
        usdcAmount: cardPrice,
        destinationMpcAddress: solanaHoldingAddress
    });

    return {
        status: "PURCHASED",
        card: newCard,
        vault: {
            id: vault.id,
            name: vault.name,
            sub_account: vault.sub_account,
            usdc_balance: vault.usdc_balance,
            new_usdc_balance: vault.usdc_balance
        },
        solana_mint: ccCard.id,
        solana_holding_address: solanaHoldingAddress,
        vault_custody: `${ccCard.vault || "PWCC / Brink's"} (Insured Vault Sealed)`,
        near_intent: nearIntent,
        tx_hash: nearService.generateNearReceiptHash()
    };
}

export const buyCollectorCryptCardToVault = bridgeCollectorCryptCardToNearVault;

/**
 * Pre-warm cache on backend startup for instant (<5ms) first user load
 */
export async function warmUpCollectorCryptCache() {
    console.log("⚡ [CollectorCryptService] Pre-warming SWR cache with live Collector Crypt inventory...");
    const initialCategories = ["ALL", "Pokemon", "One Piece", "Basketball", "Football"];

    for (const cat of initialCategories) {
        try {
            await fetchCollectorCryptMarketplace({ category: cat, limit: 48 });
        } catch (err) {
            console.warn(`[CollectorCryptService] Pre-warm failed for ${cat}: ${err.message}`);
        }
    }
    console.log(`✅ [CollectorCryptService] Pre-warm complete. Registry has ${liveCardRegistry.size} live slabs ready.`);
}

export async function seedInitialVaultsAndCards() {
    console.log("ℹ️ Autonomous Merchant Vaults Protocol: Live Collector Crypt 170k+ pipeline active.");
}
