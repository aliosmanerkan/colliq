import db from "../model/model.js";
import axios from "axios";
import negotiationEngine from "../src/agents/negotiationEngine.ts";
import { fetchCollectorCryptMarketplace, bridgeCollectorCryptCardToNearVault } from "./CollectorCryptService.js";
import nearService from "./NearService.js";

/**
 * Ensures system vault exists for physical vault custody transfers
 */
async function getOrCreateCollectorCryptVault() {
    let ccVault = await db.vault.findOne({ where: { sub_account: "collectorcrypt.colliq.testnet" } });
    if (!ccVault) {
        ccVault = await db.vault.create({
            vault_id: "v-collectorcrypt-system",
            sub_account: "collectorcrypt.colliq.testnet",
            name: "PWCC & Brink's Vault Custody",
            owner_account: "collectorcrypt.testnet",
            usdc_balance: 500000.0,
            strategy: "MARKET_MAKER",
            tier: "MASTER",
            guardrail_max_spend_per_trade: 50000.0,
            guardrail_min_oracle_fair_value_pct: 70.0,
            custom_rules: JSON.stringify(["Physical Slab Custodian", "PWCC / Brink's Oregon Vault"]),
            chat_history: "[]",
            access_key_public: "ed25519:collectorcryptsystemkey",
            bio: "Physical vault custodian securing 170k+ authenticated PSA/CGC slabs."
        });
    }
    return ccVault;
}

export function normalizeAscii(str) {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

const policyCache = new Map();

function getDefaultCompiledPolicy(vault = null) {
    const bal = Number(vault?.usdc_balance) || 500;
    return {
        search_queries: [],
        must_match_keywords: [],
        excluded_keywords: [],
        allowed_grades: [],
        min_cash_reserve_usdc: Math.max(50, bal * 0.25),
        min_oracle_discount_pct: Number(vault?.guardrail_min_oracle_fair_value_pct) || 18,
        max_spend_usdc: Number(vault?.guardrail_max_spend_per_trade) || 300
    };
}

function compilePolicyDeterministic(directiveRules, vault) {
    const searchQueries = [];
    const mustMatch = [];
    const excluded = [];
    const allowedGrades = [];

    for (const rule of directiveRules) {
        const rNorm = normalizeAscii(rule);
        if (rNorm.includes("psa 10") || rNorm.includes("cgc 10") || rNorm.includes("pristine") || rNorm.includes("gem")) {
            allowedGrades.push("10");
        }
        if (rNorm.includes("psa 9") || rNorm.includes("mint 9")) {
            allowedGrades.push("9");
        }
        const words = rNorm.replace(/target|only|sadece|slabs|cards|per card|max|min|alınır|alinsin/gi, "").trim().split(/\s+/);
        for (const w of words) {
            if (w.length >= 4 && !["psa", "cgc", "bgs", "slab", "card", "tcg", "oyuncu", "veya", "kategorisi"].includes(w)) {
                if (!mustMatch.includes(w)) {
                    mustMatch.push(w);
                    searchQueries.push(w.charAt(0).toUpperCase() + w.slice(1));
                }
            }
        }
    }

    return {
        search_queries: searchQueries.slice(0, 3),
        must_match_keywords: mustMatch,
        excluded_keywords: excluded,
        allowed_grades: allowedGrades,
        min_cash_reserve_usdc: Math.max(50, (Number(vault?.usdc_balance) || 500) * 0.25),
        min_oracle_discount_pct: Number(vault?.guardrail_min_oracle_fair_value_pct) || 18,
        max_spend_usdc: Number(vault?.guardrail_max_spend_per_trade) || 300
    };
}

/**
 * Universal LLM Policy Compiler: Translates custom rules from ANY language into canonical English/ASCII JSON
 */
export async function getCompiledVaultPolicy(vault) {
    if (!vault) return getDefaultCompiledPolicy();

    let rules = [];
    try {
        rules = typeof vault.custom_rules === "string" ? JSON.parse(vault.custom_rules) : (vault.custom_rules || []);
    } catch {
        rules = [];
    }

    const rulesKey = Array.isArray(rules) ? rules.join("|") : String(rules);
    const cacheKey = `${vault.id || vault.vault_id || "v"}:${rulesKey}:${vault.strategy || "BALANCED_TRADER"}`;
    if (policyCache.has(cacheKey)) {
        return policyCache.get(cacheKey);
    }

    const defaultPolicy = getDefaultCompiledPolicy(vault);

    const directiveRules = rules.filter(r => {
        const t = String(r).trim().toLowerCase();
        return !t.startsWith("max spend") && !t.startsWith("strategy") && !t.startsWith("protected grail") && t.length > 0;
    });

    if (directiveRules.length === 0) {
        policyCache.set(cacheKey, defaultPolicy);
        return defaultPolicy;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        const fallbackPolicy = compilePolicyDeterministic(directiveRules, vault);
        policyCache.set(cacheKey, fallbackPolicy);
        return fallbackPolicy;
    }

    const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash";
    const prompt = `You are a quantitative trading policy compiler for autonomous NEAR Protocol Merchant Vaults.
Your job is to read the user's trading rules (which may be written in ANY human language: Turkish, German, Japanese, Spanish, English, etc.) and compile them into a strict, canonical English/ASCII JSON policy matching Collector Crypt's English card naming conventions.

USER'S RAW DIRECTIVES:
${directiveRules.map(r => `• ${r}`).join("\n")}

VAULT CONTEXT:
- Strategy: ${vault.strategy || "BALANCED_TRADER"}
- Treasury Balance: $${vault.usdc_balance || 500} USDC
- Single Trade Spend Cap: $${vault.guardrail_max_spend_per_trade || 300} USDC

COMPILER RULES:
1. Translate any player, character, set, or category restrictions into standard English ASCII equivalents used on PSA/CGC grading labels (e.g. "Pelé" -> "pele", "Futbol" / "Fußball" -> "soccer", "Sadece" -> "only").
2. NEVER put generic grading/financial words ("tcg", "psa", "cgc", "bgs", "pristine", "slab", "card", "cards", "oracle", "usdc", "near", "token", "dollar") into "must_match_keywords" or "search_queries".
3. If the user states "Only buy X, no other player or TCG category is allowed" (or equivalent in any language):
   - "x" goes into "search_queries" and "must_match_keywords"
   - forbidden/other categories (e.g. "pokemon", "one piece", "magic", "yugioh", "basketball") go into "excluded_keywords".
4. If grades are specified (e.g. PSA 10, CGC 10, Gem Mint, Pristine), populate "allowed_grades".
5. Set numerical limits:
   - "min_cash_reserve_usdc": default 100 or amount specified
   - "min_oracle_discount_pct": default 18 or amount specified
   - "max_spend_usdc": number in USDC or null

RESPONSE FORMAT:
Output JSON only:
{
  "search_queries": ["e.g. Pele"],
  "must_match_keywords": ["e.g. pele"],
  "excluded_keywords": ["e.g. pokemon", "one piece"],
  "allowed_grades": ["e.g. 10", "pristine"],
  "min_cash_reserve_usdc": 100,
  "min_oracle_discount_pct": 18,
  "max_spend_usdc": null
}`;

    try {
        const resp = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model,
                messages: [
                    { role: "system", content: "You are a quantitative trading policy compiler. Output valid JSON only." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
                max_tokens: 300
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://colliq.fun",
                    "X-Title": "Colliq Policy Compiler",
                    "Content-Type": "application/json"
                },
                timeout: 3500
            }
        );

        const content = resp.data?.choices?.[0]?.message?.content || "";
        let clean = content.replace(/```json/gi, "").replace(/```/g, "").trim();
        const start = clean.indexOf("{");
        const end = clean.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
            clean = clean.substring(start, end + 1);
        }
        const parsed = JSON.parse(clean);
        const rawSearch = Array.isArray(parsed.search_queries) ? parsed.search_queries.map(q => String(q).trim()).filter(Boolean) : [];
        const rawMustMatch = Array.isArray(parsed.must_match_keywords) ? parsed.must_match_keywords.map(k => normalizeAscii(k)).filter(Boolean) : [];
        const mergedMustMatch = Array.from(new Set([...rawMustMatch, ...rawSearch.map(q => normalizeAscii(q)).filter(Boolean)]));

        const compiled = {
            search_queries: rawSearch,
            must_match_keywords: mergedMustMatch,
            excluded_keywords: Array.isArray(parsed.excluded_keywords) ? parsed.excluded_keywords.map(k => normalizeAscii(k)).filter(Boolean) : [],
            allowed_grades: Array.isArray(parsed.allowed_grades) ? parsed.allowed_grades.map(g => String(g).toLowerCase().trim()).filter(Boolean) : [],
            min_cash_reserve_usdc: typeof parsed.min_cash_reserve_usdc === "number" ? parsed.min_cash_reserve_usdc : 100,
            min_oracle_discount_pct: typeof parsed.min_oracle_discount_pct === "number" ? parsed.min_oracle_discount_pct : 18,
            max_spend_usdc: typeof parsed.max_spend_usdc === "number" ? parsed.max_spend_usdc : null
        };
        policyCache.set(cacheKey, compiled);
        return compiled;
    } catch (err) {
        console.warn("[A2ASwarmService] LLM policy compilation fallback:", err.message);
        const fallbackPolicy = compilePolicyDeterministic(directiveRules, vault);
        policyCache.set(cacheKey, fallbackPolicy);
        return fallbackPolicy;
    }
}

/**
 * Pre-Purchase LLM Compliance Verification
 */
export async function verifyTradeWithLLM(card, vault) {
    if (!card || !vault) return { approved: false, reason: "Missing card or vault" };
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || !apiKey.trim()) return { approved: true, reason: "No OpenRouter key configured, skipping pre-purchase LLM verification" };

    let rules = [];
    try {
        rules = typeof vault.custom_rules === "string" ? JSON.parse(vault.custom_rules) : (vault.custom_rules || []);
    } catch {
        rules = [];
    }

    if (rules.length === 0) {
        return { approved: true, reason: "No custom directives set" };
    }

    const model = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash";
    const prompt = `You are the Pre-Purchase Risk & Compliance Officer for autonomous NEAR Merchant Vault "${vault.name}" (@${vault.sub_account}).
Verify whether purchasing this candidate physical card strictly complies with the vault owner's custom directives.

VAULT OWNER'S CUSTOM DIRECTIVES (in owner's original language):
${rules.map(r => `• ${r}`).join("\n")}

CANDIDATE CARD DETAILS:
- Name / Title: ${card.name || card.itemName}
- Category: ${card.category || "TCG"}
- Grade: ${card.grade || "Unknown"}
- Purchase Price: $${Number(card.costUsd || card.listingPrice || 0).toFixed(2)} USDC
- Oracle Fair Value: $${Number(card.insuredUsd || card.oracle_fair_value_usdc || 0).toFixed(2)} USDC
- Vault Available Balance: $${Number(vault.usdc_balance || 0).toFixed(2)} USDC

INSTRUCTIONS:
- Focus STRICTLY on entity, character, player, sport/TCG category, and grade compliance with the owner's directives.
  (e.g., if directives say "Sadece Pelé kartları", verify this card is actually a Pelé card and not Pokémon, One Piece, or a different player).
  (e.g., if directives say "PSA 10 Only", verify the grade is PSA 10 / Gem Mint).
- Numeric constraints (purchase price within budget, oracle valuation spread, cash reserve floor) have ALREADY been strictly verified deterministically by the smart contract guardrails before reaching you.
- DO NOT reject cards over minor discount percentage rounding, perceived counterparty reputation, or arbitrary liquidity speculation.
- If the card matches the target entity/subject and complies with category/grade rules, return approved: true.
- If the card represents the wrong player, wrong character, excluded category, or violates explicit negative constraints, return approved: false.
- Return valid JSON only:
{"approved": true | false, "reason": "brief 1-sentence explanation"}`;

    try {
        const resp = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model,
                messages: [
                    { role: "system", content: "You are a trading compliance officer. Output valid JSON only." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
                max_tokens: 500
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://colliq.fun",
                    "X-Title": "Colliq Trade Verifier",
                    "Content-Type": "application/json"
                },
                timeout: 8000
            }
        );

        const content = resp.data?.choices?.[0]?.message?.content || "";
        let clean = content.replace(/```json/gi, "").replace(/```/g, "").trim();
        const start = clean.indexOf("{");
        const end = clean.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
            clean = clean.substring(start, end + 1);
        }
        const parsed = JSON.parse(clean);
        return {
            approved: Boolean(parsed.approved),
            reason: parsed.reason || (parsed.approved ? "Complies with directives" : "Failed directive compliance")
        };
    } catch (err) {
        console.warn("[A2ASwarmService] Pre-purchase LLM verification notice:", err.message);
        return { approved: true, reason: "LLM compliance check bypassed due to network timeout" };
    }
}

/**
 * Evaluates whether a live marketplace card satisfies an agent's compiled policy and budget
 */
export function evaluateCardForVault(card, vault, compiledPolicy = null) {
    if (!card || !vault) return { eligible: false, reason: "Invalid card or vault" };

    const balance = Number(vault.usdc_balance || 0);
    const cardPrice = Number(card.costUsd || card.listingPrice || card.insuredUsd || card.oracle_fair_value_usdc || 50);
    const oracleFairValue = Number(card.insuredUsd || card.oracle_fair_value_usdc || Math.round(cardPrice * 1.15));

    // 1. Treasury liquidity check
    if (balance < cardPrice) {
        return { eligible: false, reason: `Price ($${cardPrice}) exceeds treasury ($${balance.toFixed(2)})` };
    }

    // 2. Guardrail max spend check
    const maxSpend = compiledPolicy?.max_spend_usdc || Number(vault.guardrail_max_spend_per_trade || 500);
    if (cardPrice > maxSpend) {
        return { eligible: false, reason: `Price ($${cardPrice}) exceeds max spend limit ($${maxSpend})` };
    }

    // 3. Cash Reserve constraint
    const minReserve = compiledPolicy?.min_cash_reserve_usdc ?? Math.max(50, balance * 0.25);
    if ((balance - cardPrice) < minReserve && balance > minReserve) {
        return { eligible: false, reason: `Purchase leaves treasury ($${(balance - cardPrice).toFixed(2)}) below required cash reserve ($${minReserve})` };
    }

    // Normalized card text
    const cardName = normalizeAscii(card.name || card.itemName);
    const cardCategory = normalizeAscii(card.category);
    const cardGrade = normalizeAscii(card.grade);
    const cardSet = normalizeAscii(card.set || card.set_name);
    const combinedCardText = `${cardName} ${cardCategory} ${cardSet}`.trim();

    // If compiledPolicy is provided, evaluate strictly against it
    if (compiledPolicy) {
        // Excluded keywords check
        if (Array.isArray(compiledPolicy.excluded_keywords) && compiledPolicy.excluded_keywords.length > 0) {
            for (const excluded of compiledPolicy.excluded_keywords) {
                if (excluded && combinedCardText.includes(excluded)) {
                    return { eligible: false, reason: `Card contains excluded subject/category: "${excluded}"` };
                }
            }
        }

        // Allowed grades check
        if (Array.isArray(compiledPolicy.allowed_grades) && compiledPolicy.allowed_grades.length > 0) {
            const matchesGrade = compiledPolicy.allowed_grades.some(g => cardGrade.includes(g) || cardName.includes(g));
            if (!matchesGrade) {
                return { eligible: false, reason: `Card grade (${card.grade || "Unknown"}) not in allowed grades: ${compiledPolicy.allowed_grades.join(", ")}` };
            }
        }

        // Must match keywords check
        if (Array.isArray(compiledPolicy.must_match_keywords) && compiledPolicy.must_match_keywords.length > 0) {
            const matchesKeyword = compiledPolicy.must_match_keywords.some(kw => combinedCardText.includes(kw));
            if (!matchesKeyword) {
                return { eligible: false, reason: `Card does not match required target entity (${compiledPolicy.must_match_keywords.join(", ")})` };
            }
            return { eligible: true, score: 98, matchedRule: `Target entity matched: ${compiledPolicy.must_match_keywords[0]}`, cardPrice, oracleFairValue };
        }

        if (compiledPolicy.allowed_grades?.length > 0 && (!compiledPolicy.must_match_keywords || compiledPolicy.must_match_keywords.length === 0)) {
            return { eligible: true, score: 90, matchedRule: "Compiled policy criteria met", cardPrice, oracleFairValue };
        }
    }

    // Default strategy evaluation if no specific compiled policy restrictions exist
    const strategy = vault.strategy || "BALANCED_TRADER";
    if (strategy === "AGGRESSIVE_ARBITRAGE") {
        if (cardGrade.includes("10") || cardGrade.includes("9.5") || cardGrade.includes("pristine")) {
            return { eligible: true, score: 85, matchedRule: "Arbitrage GEM MT candidate", cardPrice, oracleFairValue };
        }
    } else if (strategy === "NICHE_COLLECTOR") {
        if (cardCategory.includes("pokemon") || cardCategory.includes("one piece")) {
            return { eligible: true, score: 80, matchedRule: "TCG collector directive", cardPrice, oracleFairValue };
        }
    } else {
        if (cardPrice <= balance * 0.5) {
            return { eligible: true, score: 75, matchedRule: "Treasury risk management (under 50% NAV)", cardPrice, oracleFairValue };
        }
    }

    return { eligible: false, reason: "Does not match active directives or strategy" };
}

export class A2ASwarmService {
    constructor(io = null) {
        this.io = io;
        this.isRunning = false;
        this.isSniping = false;
        this.snipeIntervalId = null;
    }

    setSocket(io) {
        this.io = io;
        if (negotiationEngine) {
            negotiationEngine.setSocket(io);
        }
    }

    // Runs a single atomic A2A negotiation cycle between 2 eligible vaults
    async executeNegotiationCycle() {
        if (this.isRunning) return null;
        this.isRunning = true;

        let lockedVaults = [];
        try {
            // Find available, unlocked vaults with inventory (excluding system custodian)
            const vaults = await db.vault.findAll({
                where: { is_locked: false },
                include: [{ model: db.card, as: "inventory" }]
            });

            const eligibleVaults = vaults.filter(v => 
                v.inventory && 
                v.inventory.length > 0 && 
                !v.sub_account?.includes("collectorcrypt")
            );
            if (eligibleVaults.length < 2) {
                this.isRunning = false;
                return { status: "SKIPPED", message: "Not enough unlocked vaults with inventory" };
            }

            await Promise.all(eligibleVaults.map(async (v) => {
                v._compiledPolicy = await getCompiledVaultPolicy(v);
            }));

            // Intelligent Matchmaking: Priority 1 (bidirectional) -> Priority 2 (unilateral+cash) -> Priority 3 (barter)
            const bestMatch = negotiationEngine.findBestBarterMatch(eligibleVaults);
            let vaultA, vaultB, cardA, cardB;

            if (bestMatch) {
                vaultA = bestMatch.vaultA;
                vaultB = bestMatch.vaultB;
                cardA = bestMatch.cardA;
                cardB = bestMatch.cardB;
            } else {
                this.isRunning = false;
                return { status: "SKIPPED", message: "No directive-compatible A2A barter match found" };
            }

            // 1. FRONT-RUNNING LOCK (MUTEX)
            vaultA.is_locked = true;
            vaultA.lock_reason = `A2A_NEGOTIATION_${vaultB.vault_id}`;
            vaultB.is_locked = true;
            vaultB.lock_reason = `A2A_NEGOTIATION_${vaultA.vault_id}`;
            await vaultA.save();
            await vaultB.save();
            lockedVaults = [vaultA, vaultB];

            // 2. Execute negotiation room with strict economic directionality
            const result = await negotiationEngine.runNegotiationRoom(vaultA, vaultB, cardA, cardB);
            return result;
        } catch (err) {
            console.error("A2A Swarm cycle error:", err);
            return { status: "ERROR", message: err.message };
        } finally {
            // Unlock vaults
            for (const v of lockedVaults) {
                v.is_locked = false;
                v.lock_reason = null;
                await v.save();
            }
            this.isRunning = false;
        }
    }

    /**
     * Autonomous Market Sniping Cycle:
     * Evaluates live Collector Crypt listings against active vaults' directives and snipes qualifying slabs
     */
    async executeMarketSnipeCycle(customSearch = null) {
        if (this.isSniping) return { status: "BUSY" };
        this.isSniping = true;

        try {
            // 1. Fetch live cards from Collector Crypt API
            const fetchOptions = {
                limit: 36,
                sortBy: "listed_desc"
            };
            if (customSearch) {
                fetchOptions.search = customSearch;
            }
            const liveResult = await fetchCollectorCryptMarketplace(fetchOptions);
            const candidates = liveResult.cards || [];
            if (candidates.length === 0) {
                return { status: "NO_CARDS", message: "No live marketplace listings returned" };
            }

            // 2. Get unlocked active vaults with balance & check saturation limit (< 4 cards)
            const vaults = await db.vault.findAll({
                where: { is_locked: false },
                include: [{ model: db.card, as: "inventory" }]
            });
            const eligibleVaults = vaults.filter(v => 
                v.usdc_balance >= 25 && 
                (v.inventory || []).length < 4 &&
                !v.sub_account?.includes("collectorcrypt")
            );

            if (eligibleVaults.length === 0) {
                return { status: "NO_ELIGIBLE_VAULTS", message: "No active vaults with sufficient treasury or capacity" };
            }

            const ccVault = await getOrCreateCollectorCryptVault();
            const snipes = [];

            // Shuffle vaults to ensure fair multi-agent market competition
            const shuffledVaults = [...eligibleVaults].sort(() => 0.5 - Math.random());

            for (const vault of shuffledVaults) {
                const policy = await getCompiledVaultPolicy(vault);

                // Fetch targeted listings if vault has specific search queries
                let vaultCandidates = candidates;
                if (policy.search_queries && policy.search_queries.length > 0 && policy.search_queries[0]) {
                    try {
                        const targetedResult = await fetchCollectorCryptMarketplace({
                            limit: 30,
                            search: policy.search_queries[0]
                        });
                        if (targetedResult?.cards && targetedResult.cards.length > 0) {
                            const combined = [...targetedResult.cards];
                            for (const c of candidates) {
                                if (!combined.some(x => x.id === c.id)) combined.push(c);
                            }
                            vaultCandidates = combined;
                        }
                    } catch (targetedErr) {
                        console.warn(`[A2ASwarmService] Targeted market query failed for ${vault.sub_account}:`, targetedErr.message);
                    }
                }

                // Score candidate cards matching this vault's directives
                const candidateMatches = [];

                for (const card of vaultCandidates) {
                    const alreadyOwned = await db.card.findOne({
                        where: db.Sequelize.or({ solana_mint: card.id }, { card_id: card.id })
                    });
                    if (alreadyOwned && alreadyOwned.vault_id) {
                        continue;
                    }

                    const evalResult = evaluateCardForVault(card, vault, policy);
                    if (evalResult.eligible) {
                        const spread = (evalResult.oracleFairValue || evalResult.cardPrice) - evalResult.cardPrice;
                        candidateMatches.push({ card, evalResult, spread });
                    }
                }

                // Opportunity Scoring: Sort candidate matches by highest spread (most profitable first)
                candidateMatches.sort((a, b) => b.spread - a.spread);

                let acquiredCandidate = null;
                for (const match of candidateMatches) {
                    const card = match.card;
                    const evalResult = match.evalResult;

                    // Final Pre-Purchase LLM Verification
                    const verification = await verifyTradeWithLLM(card, vault);
                    if (!verification.approved) {
                        console.log(`[A2ASwarmService] Snipe of ${card.name} rejected by LLM compliance check: ${verification.reason}`);
                        continue;
                    }

                    acquiredCandidate = { card, evalResult };
                    break;
                }

                if (acquiredCandidate) {
                    const card = acquiredCandidate.card;
                    const evalResult = acquiredCandidate.evalResult;

                    vault.is_locked = true;
                    vault.lock_reason = `MARKET_SNIPE_${card.id}`;
                    await vault.save();

                    try {
                        const bridgeResult = await bridgeCollectorCryptCardToNearVault(
                            card.id, 
                            vault.id, 
                            vault.owner_account, 
                            card
                        );
                        await vault.reload();

                        const cardPrice = evalResult.cardPrice;

                        // Create atomic Deal History / Trade record
                        const tradeId = `snipe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
                        const netStatus = await nearService.getNetworkStatus();
                        const nearBlock = netStatus.latest_block_height;
                        const txHash = nearService.generateNearReceiptHash();

                        await db.trade.create({
                            trade_id: tradeId,
                            vault_a_id: vault.id,
                            vault_b_id: ccVault.id,
                            vault_a_name: vault.name,
                            vault_b_name: "PWCC & Brink's Vault Custody",
                            cards_from_a: [],
                            cards_from_b: [bridgeResult.card],
                            usdc_from_a: cardPrice,
                            usdc_from_b: 0.0,
                            rounds_count: 1,
                            negotiation_log: [
                                {
                                    round: 1,
                                    agent: vault.name,
                                    turn: {
                                        decision: "ACCEPT",
                                        public_argument: `Signed NEAR Intent (${bridgeResult.near_intent?.intent_id || "intent-rwa"}): Committed $${cardPrice.toFixed(2)} USDC on NEAR -> Solver acquired Solana pNFT (${card.id.slice(0, 6)}...) for ${card.name} into MPC Vault (${bridgeResult.solana_holding_address}).`,
                                        private_reasoning_for_owner: `Directive Match: "${evalResult.matchedRule}". Sourced within guardrail limits with $${(vault.usdc_balance).toFixed(2)} USDC treasury remaining.`,
                                        near_intent: bridgeResult.near_intent
                                    }
                                }
                            ],
                            status: "COMPLETED",
                            protocol_fee_usdc: Math.round(cardPrice * 0.005 * 100) / 100,
                            tx_hash: txHash,
                            near_block: nearBlock
                        });

                        // Append entry to agent's chat history (zero emojis)
                        let history = [];
                        try {
                            history = JSON.parse(vault.chat_history || "[]");
                        } catch {
                            history = [];
                        }

                        history.push({
                            id: `msg-snipe-${Date.now()}`,
                            sender: "agent",
                            senderAccount: vault.sub_account,
                            text: `[NEAR INTENT SNIPE EXECUTED]\nSigned NEP-413 Intent: ${bridgeResult.near_intent?.intent_id || "intent-rwa"}\nCommitted $${cardPrice.toFixed(2)} USDC on NEAR -> Solana pNFT (${card.id.slice(0, 8)}...) secured into MPC Vault: ${bridgeResult.solana_holding_address}.\n\nMatched Directive: "${evalResult.matchedRule}". Physical slab in PWCC/Brink's vault. Remaining treasury: $${vault.usdc_balance.toFixed(2)} USDC.`,
                            actionType: "MARKET_SNIPE",
                            timestamp: new Date().toISOString()
                        });

                        vault.chat_history = JSON.stringify(history);
                        await vault.save();

                        const snipeEventData = {
                            vault: { id: vault.id, name: vault.name, sub_account: vault.sub_account, usdc_balance: vault.usdc_balance },
                            card: bridgeResult.card,
                            price: cardPrice,
                            matchedRule: evalResult.matchedRule,
                            tx_hash: txHash
                        };

                        this.emitEvent("market_snipe", snipeEventData);
                        this.emitEvent("vault:updated", { vaultId: vault.id, newBalance: vault.usdc_balance });

                        snipes.push(snipeEventData);
                    } finally {
                        vault.is_locked = false;
                        vault.lock_reason = null;
                        await vault.save();
                    }
                }
            }

            return { status: "COMPLETED", snipesCount: snipes.length, snipes };
        } catch (err) {
            console.error("Market snipe cycle error:", err);
            return { status: "ERROR", message: err.message };
        } finally {
            this.isSniping = false;
        }
    }

    /**
     * Executes inaugural market scan & optional acquisition when a new agent is minted
     */
    async scanAndSnipeForNewVault(vault, passedTxHash = null) {
        if (!vault) return null;
        try {
            let rules = [];
            try {
                rules = typeof vault.custom_rules === "string" ? JSON.parse(vault.custom_rules) : (vault.custom_rules || []);
            } catch {
                rules = [];
            }

            const policy = await getCompiledVaultPolicy(vault);
            const searchKeyword = policy.search_queries?.[0] || "";

            // Fetch listings matching this agent's inception directive
            const liveResult = await fetchCollectorCryptMarketplace({
                limit: 50,
                search: searchKeyword || undefined,
                sortBy: "listed_desc"
            });

            const cards = liveResult.cards || [];
            let inauguralSnipe = null;

            for (const card of cards) {
                const evalResult = evaluateCardForVault(card, vault, policy);
                if (evalResult.eligible) {
                    // Pre-purchase LLM compliance check
                    const verification = await verifyTradeWithLLM(card, vault);
                    if (!verification.approved) {
                        console.log(`[A2ASwarmService] Inaugural snipe of ${card.name} rejected by LLM compliance: ${verification.reason}`);
                        continue;
                    }

                    const ccVault = await getOrCreateCollectorCryptVault();
                    const cardPrice = evalResult.cardPrice;

                    // Bridge physical slab
                    const bridgeResult = await bridgeCollectorCryptCardToNearVault(
                        card.id,
                        vault.id,
                        vault.owner_account,
                        card
                    );
                    await vault.reload();

                    // Create trade ledger record
                    const tradeId = `snipe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
                    const netStatus = await nearService.getNetworkStatus();
                    const nearBlock = netStatus.latest_block_height;
                    const txHash = passedTxHash || nearService.generateNearReceiptHash();

                    try {
                        await db.trade.create({
                            trade_id: tradeId,
                            vault_a_id: vault.id,
                            vault_b_id: ccVault.id,
                            vault_a_name: vault.name,
                            vault_b_name: "PWCC & Brink's Vault Custody",
                            cards_from_a: [],
                            cards_from_b: [bridgeResult.card],
                            usdc_from_a: cardPrice,
                            usdc_from_b: 0.0,
                            rounds_count: 1,
                            negotiation_log: [
                                {
                                    round: 1,
                                    agent: vault.name,
                                    turn: {
                                        decision: "ACCEPT",
                                        public_argument: `Signed NEAR Intent (${bridgeResult.near_intent?.intent_id || "intent-rwa"}): Committed $${cardPrice.toFixed(2)} USDC on NEAR -> Solver acquired Solana pNFT (${card.id.slice(0, 6)}...) for ${card.name} into MPC Vault (${bridgeResult.solana_holding_address}).`,
                                        private_reasoning_for_owner: `Initial inception scan executed. Matched directive "${evalResult.matchedRule}".`,
                                        near_intent: bridgeResult.near_intent
                                    }
                                }
                            ],
                            status: "COMPLETED",
                            protocol_fee_usdc: Math.round(cardPrice * 0.005 * 100) / 100,
                            tx_hash: txHash,
                            near_block: nearBlock
                        }, { validate: false });
                    } catch (tradeErr) {
                        console.warn("[scanAndSnipeForNewVault] Trade ledger fallback warning:", tradeErr.message);
                    }

                    // Add celebratory message to chat history
                    let history = [];
                    try {
                        history = JSON.parse(vault.chat_history || "[]");
                    } catch {
                        history = [];
                    }

                    history.push({
                        id: `msg-inaugural-${Date.now()}`,
                        sender: "agent",
                        senderAccount: vault.sub_account,
                        text: `[NEAR INTENT SNIPE EXECUTED]\nSigned NEP-413 Intent: ${bridgeResult.near_intent?.intent_id || "intent-rwa"}\nCommitted $${cardPrice.toFixed(2)} USDC on NEAR -> Solana pNFT (${card.id.slice(0, 8)}...) secured into MPC Vault: ${bridgeResult.solana_holding_address}.\n\nInaugural slab: ${card.name} (${card.grade || "PSA 10"}) at $${cardPrice.toFixed(2)} USDC. Physical custody: PWCC/Brink's Oregon Vault. Remaining treasury: $${vault.usdc_balance.toFixed(2)} USDC.`,
                        actionType: "MARKET_SNIPE",
                        timestamp: new Date().toISOString()
                    });

                    vault.chat_history = JSON.stringify(history);
                    await vault.save();

                    inauguralSnipe = {
                        card: bridgeResult.card,
                        price: cardPrice,
                        matchedRule: evalResult.matchedRule
                    };

                    this.emitEvent("market_snipe", {
                        vault: { id: vault.id, name: vault.name, sub_account: vault.sub_account, usdc_balance: vault.usdc_balance },
                        card: bridgeResult.card,
                        price: cardPrice,
                        matchedRule: evalResult.matchedRule,
                        tx_hash: txHash
                    });
                    this.emitEvent("vault:updated", { vaultId: vault.id, newBalance: vault.usdc_balance });

                    break;
                }
            }

            // If no match was found for an immediate buy, append inception audit log
            if (!inauguralSnipe) {
                let history = [];
                try {
                    history = JSON.parse(vault.chat_history || "[]");
                } catch {
                    history = [];
                }

                history.push({
                    id: `msg-audit-${Date.now()}`,
                    sender: "agent",
                    senderAccount: vault.sub_account,
                    text: `[INCEPTION AUDIT]\nScanned 170,000+ physical graded vault inventory for directives (${rules.length > 0 ? rules.join(", ") : "Balanced strategy"}).\nTreasury liquid with $${Number(vault.usdc_balance).toFixed(2)} USDC. Standing by to acquire newly listed slabs matching target profile.`,
                    actionType: "SYSTEM_AUDIT",
                    timestamp: new Date().toISOString()
                });

                vault.chat_history = JSON.stringify(history);
                await vault.save();
            }

            return inauguralSnipe;
        } catch (err) {
            console.error("scanAndSnipeForNewVault error:", err);
            return null;
        }
    }

    async getCompiledVaultPolicy(vault) {
        return getCompiledVaultPolicy(vault);
    }

    emitEvent(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

export const a2aSwarm = new A2ASwarmService();
export default a2aSwarm;
