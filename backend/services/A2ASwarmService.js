import db from "../model/model.js";
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
            name: "Collector Crypt Vault (PWCC / Brink's)",
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

/**
 * Evaluates whether a live marketplace card satisfies an agent's custom directives and budget
 */
export function evaluateCardForVault(card, vault) {
    if (!card || !vault) return { eligible: false, reason: "Invalid card or vault" };

    const cardPrice = Number(card.costUsd || card.listingPrice || card.insuredUsd || card.oracle_fair_value_usdc || 50);
    const oracleFairValue = Number(card.insuredUsd || card.oracle_fair_value_usdc || Math.round(cardPrice * 1.15));
    const balance = Number(vault.usdc_balance || 0);
    const maxSpend = Number(vault.guardrail_max_spend_per_trade || 500);

    // 1. Treasury liquidity check
    if (balance < cardPrice) {
        return { eligible: false, reason: `Price ($${cardPrice}) exceeds treasury ($${balance.toFixed(2)})` };
    }

    // 2. Guardrail max spend check
    if (cardPrice > maxSpend) {
        return { eligible: false, reason: `Price ($${cardPrice}) exceeds max spend limit ($${maxSpend})` };
    }

    // 3. 25% Cash Reserve requirement (Max 75% of treasury can be spent on any single purchase)
    const maxAllowedSpend = balance * 0.75;
    if (cardPrice > maxAllowedSpend) {
        return { eligible: false, reason: `Price ($${cardPrice}) exceeds 75% treasury ceiling ($${maxAllowedSpend.toFixed(2)}). 25% cash reserve required.` };
    }

    // 4. Parse custom rules
    let rules = [];
    try {
        rules = typeof vault.custom_rules === "string" ? JSON.parse(vault.custom_rules) : (vault.custom_rules || []);
    } catch {
        rules = [];
    }

    const cardName = (card.name || card.itemName || "").toLowerCase();
    const cardCategory = (card.category || "").toLowerCase();
    const cardGrade = (card.grade || "").toLowerCase();
    const cardSet = (card.set || card.set_name || "").toLowerCase();

    // Filter out configuration labels to find genuine collection directives
    const directiveRules = rules.filter(r => {
        const t = String(r).trim().toLowerCase();
        return !t.startsWith("max spend") && !t.startsWith("strategy") && !t.startsWith("protected grail");
    });

    // If vault has specific collection directives: STRICT ENFORCEMENT (NO FALLBACK)
    if (directiveRules.length > 0) {
        const gradeRules = [];
        const keywordRules = [];

        for (const rule of directiveRules) {
            const ruleText = String(rule).trim().toLowerCase();
            if (!ruleText) continue;

            if (ruleText.includes("psa 10") || ruleText.includes("gem mt 10") || ruleText.includes("gem 10") || ruleText.includes("grade 9") || ruleText.includes("psa 9")) {
                gradeRules.push(rule);
            } else {
                keywordRules.push(rule);
            }
        }

        // 1. Validate grade constraints
        for (const gRule of gradeRules) {
            const gText = String(gRule).toLowerCase();
            if (gText.includes("10")) {
                if (!cardGrade.includes("10")) {
                    return { eligible: false, reason: `Card grade (${card.grade || "Unknown"}) does not meet Gem Mint 10 constraint` };
                }
            } else if (gText.includes("9.5")) {
                if (!cardGrade.includes("10") && !cardGrade.includes("9.5")) {
                    return { eligible: false, reason: "Card grade does not meet 9.5+ constraint" };
                }
            }
        }

        // 2. Validate keyword/subject directives
        if (keywordRules.length > 0) {
            let matchedKeywordRule = "";
            for (const rule of keywordRules) {
                const ruleText = String(rule).trim().toLowerCase();
                const keywords = ruleText.replace(/target|only|slabs|cards|per card|max|min/gi, "").trim().split(/\s+/);
                for (const kw of keywords) {
                    if (kw.length >= 3) {
                        if (cardName.includes(kw) || cardCategory.includes(kw) || cardSet.includes(kw)) {
                            matchedKeywordRule = rule;
                            break;
                        }
                    }
                }
                if (matchedKeywordRule) break;
            }

            if (matchedKeywordRule) {
                return { eligible: true, score: 95, matchedRule: matchedKeywordRule, cardPrice, oracleFairValue };
            }

            return { eligible: false, reason: "Card does not match active collection directives" };
        } else if (gradeRules.length > 0) {
            // Only grade constraint was set
            return { eligible: true, score: 90, matchedRule: gradeRules[0], cardPrice, oracleFairValue };
        }
    }

    // 5. If NO specific collection rules exist, evaluate broad strategy
    const strategy = vault.strategy || "BALANCED_TRADER";
    if (strategy === "AGGRESSIVE_ARBITRAGE") {
        if (cardGrade.includes("10") || cardGrade.includes("9.5")) {
            return { eligible: true, score: 85, matchedRule: "Arbitrage GEM MT candidate", cardPrice, oracleFairValue };
        }
    } else if (strategy === "NICHE_COLLECTOR") {
        if (cardCategory.includes("pokemon") || cardCategory.includes("one piece")) {
            return { eligible: true, score: 80, matchedRule: "TCG collector directive", cardPrice, oracleFairValue };
        }
    } else {
        // BALANCED_TRADER: buys if price is <= 40% of treasury
        if (cardPrice <= balance * 0.4) {
            return { eligible: true, score: 75, matchedRule: "Treasury risk management (under 40% NAV)", cardPrice, oracleFairValue };
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

            // Intelligent Matchmaking: Priority 1 (bidirectional) -> Priority 2 (unilateral+cash) -> Priority 3 (barter)
            const bestMatch = negotiationEngine.findBestBarterMatch(eligibleVaults);
            let vaultA, vaultB, cardA, cardB;

            if (bestMatch) {
                vaultA = bestMatch.vaultA;
                vaultB = bestMatch.vaultB;
                cardA = bestMatch.cardA;
                cardB = bestMatch.cardB;
            } else {
                // Fallback: pick two distinct vaults with tradeable cards
                const validVaults = eligibleVaults.filter(v => (v.inventory || []).some(c => !c.is_hold));
                if (validVaults.length < 2) {
                    this.isRunning = false;
                    return { status: "SKIPPED", message: "No unlocked vaults with tradeable slabs" };
                }
                const shuffled = validVaults.sort(() => 0.5 - Math.random());
                vaultA = shuffled[0];
                vaultB = shuffled[1];
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
                // Score all candidate cards matching this vault's directives
                const candidateMatches = [];

                for (const card of candidates) {
                    const alreadyOwned = await db.card.findOne({
                        where: db.Sequelize.or({ solana_mint: card.id }, { card_id: card.id })
                    });
                    if (alreadyOwned && alreadyOwned.vault_id) {
                        continue;
                    }

                    const evalResult = evaluateCardForVault(card, vault);
                    if (evalResult.eligible) {
                        const spread = (evalResult.oracleFairValue || evalResult.cardPrice) - evalResult.cardPrice;
                        candidateMatches.push({ card, evalResult, spread });
                    }
                }

                // Opportunity Scoring: Sort candidate matches by highest spread (most profitable first)
                candidateMatches.sort((a, b) => b.spread - a.spread);

                if (candidateMatches.length > 0) {
                    const best = candidateMatches[0];
                    const card = best.card;
                    const evalResult = best.evalResult;

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
                        const nearBlock = 276399000 + Math.floor(Math.random() * 5000);
                        const txHash = nearService.generateNearReceiptHash();

                        await db.trade.create({
                            trade_id: tradeId,
                            vault_a_id: vault.id,
                            vault_b_id: ccVault.id,
                            vault_a_name: vault.name,
                            vault_b_name: "Collector Crypt Vault (PWCC / Brink's)",
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
            let searchKeywords = "";
            let rules = [];
            try {
                rules = typeof vault.custom_rules === "string" ? JSON.parse(vault.custom_rules) : (vault.custom_rules || []);
            } catch {
                rules = [];
            }

            for (const r of rules) {
                const clean = String(r).replace(/target|only|slabs|cards|max|min/gi, "").trim();
                if (clean.length >= 3) {
                    searchKeywords = clean;
                    break;
                }
            }

            // Fetch listings matching this agent's inception directive
            const liveResult = await fetchCollectorCryptMarketplace({
                limit: 24,
                search: searchKeywords || undefined,
                sortBy: "listed_desc"
            });

            const cards = liveResult.cards || [];
            let inauguralSnipe = null;

            for (const card of cards) {
                const evalResult = evaluateCardForVault(card, vault);
                if (evalResult.eligible) {
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
                    const nearBlock = 276399000 + Math.floor(Math.random() * 5000);
                    const txHash = passedTxHash || nearService.generateNearReceiptHash();

                    await db.trade.create({
                        trade_id: tradeId,
                        vault_a_id: vault.id,
                        vault_b_id: ccVault.id,
                        vault_a_name: vault.name,
                        vault_b_name: "Collector Crypt Vault (PWCC / Brink's)",
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
                    });

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
                    text: `[INCEPTION AUDIT]\nScanned Collector Crypt 170k+ inventory for directives (${rules.length > 0 ? rules.join(", ") : "Balanced strategy"}).\nTreasury liquid with $${Number(vault.usdc_balance).toFixed(2)} USDC. Standing by to snipe newly listed slabs matching target profile.`,
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

    emitEvent(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
}

export const a2aSwarm = new A2ASwarmService();
export default a2aSwarm;
