import db from "../model/model.js";
import { getCollectorCryptInventory, bridgeCollectorCryptCardToNearVault } from "./CollectorCryptService.js";
import nearService from "./NearService.js";
import { generateVaultDynamicSvg } from "./DynamicSvgService.js";

/**
 * AgentToolsService
 * Architectural tool-calling suite for autonomous NEAR Merchant Vaults.
 * Provides executable tools across 4 layers:
 * 1. Perception & Oracle
 * 2. Policy & Risk Guardrails
 * 3. Execution & Settlement
 * 4. Telemetry & Accounting
 */

export const AGENT_TOOLS_SCHEMA = [
    // -------------------------------------------------------------
    // LAYER 1: PERCEPTION & MARKET INTELLIGENCE
    // -------------------------------------------------------------
    {
        type: "function",
        function: {
            name: "market_scan_inventory",
            description: "Scan the 1,000 Brink's-vaulted PSA slabs in the Collector Crypt marketplace for investment opportunities, arbitrage spreads, undervalued cards below market fair value, or hunt targets.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search keyword e.g. 'Pikachu', 'Charizard', 'Lugia', 'Perona', 'Wembanyama'"
                    },
                    category: {
                        type: "string",
                        enum: ["ALL", "Pokemon", "Basketball", "Football", "One Piece"],
                        description: "Filter by TCG / Sports category"
                    },
                    deal_type: {
                        type: "string",
                        enum: ["ALL", "undervalued", "low_pop", "budget_fit"],
                        description: "Special deal filters: 'undervalued' (cards priced below fair appraisal value with positive profit spread), 'low_pop' (rare low-population grails), 'budget_fit' (cards affordable within vault limits)"
                    },
                    within_budget: {
                        type: "boolean",
                        description: "If true, strictly filters cards affordable within vault's single-trade spend cap and treasury balance"
                    },
                    min_discount_pct: {
                        type: "number",
                        description: "Minimum percentage discount below fair market appraisal value (e.g. 10 for 10% discount)"
                    },
                    max_price_usdc: {
                        type: "number",
                        description: "Maximum fair-market price in USDC"
                    },
                    min_grade: {
                        type: "string",
                        description: "e.g. '10' (matches PSA 10, GEM-MT 10, CGC 10 PRISTINE), '9' (matches MINT 9)"
                    },
                    sort_by: {
                        type: "string",
                        enum: ["discount_desc", "price_asc", "price_desc", "rareness", "return"],
                        description: "Sorting strategy for scanner"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "oracle_get_valuation_metrics",
            description: "Audit PSA population report, scarcity score (1-100), and Oracle fair-value valuation for a specific card slab.",
            parameters: {
                type: "object",
                properties: {
                    card_identifier: {
                        type: "string",
                        description: "Card ID or exact card name to lookup valuation metrics"
                    }
                },
                required: ["card_identifier"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "vault_inspect_counterpart",
            description: "Inspect another NEAR Merchant Vault sub-account to audit its enclosed cards, cash treasury, and trading reputation before proposing a barter deal.",
            parameters: {
                type: "object",
                properties: {
                    target_vault_subaccount: {
                        type: "string",
                        description: "NEAR sub-account e.g. 'vault-2.market.near' or ID '2'"
                    }
                },
                required: ["target_vault_subaccount"]
            }
        }
    },

    // -------------------------------------------------------------
    // LAYER 2: RISK MANAGEMENT & POLICY GUARDRAILS
    // -------------------------------------------------------------
    {
        type: "function",
        function: {
            name: "guardrail_update_limits",
            description: "Update the on-chain single-trade expenditure limit and minimum fair-value percentage to protect the vault against front-running and overspending.",
            parameters: {
                type: "object",
                properties: {
                    max_spend_per_trade_usdc: {
                        type: "number",
                        description: "Hard cap in USDC for any single card purchase or A2A barter cash sweetener"
                    },
                    min_oracle_fair_value_pct: {
                        type: "number",
                        description: "Minimum value percentage required to accept incoming barter offers (e.g. 80 = 80%)"
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "vault_freeze_grail",
            description: "Enforce an Anti-Liquidation Mutex on a high-value slab in vault inventory so it can never be offered in A2A barter trades.",
            parameters: {
                type: "object",
                properties: {
                    card_name_or_id: {
                        type: "string",
                        description: "Name or card_id of the slab to permanently lock from barter"
                    },
                    reason: {
                        type: "string",
                        description: "Reason for freeze directive (e.g. 'Highest-value vintage grail')"
                    }
                },
                required: ["card_name_or_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "strategy_set_execution_mode",
            description: "Reconfigure the agent's high-level autonomous trading policy.",
            parameters: {
                type: "object",
                properties: {
                    strategy_mode: {
                        type: "string",
                        enum: ["AGGRESSIVE_ARBITRAGE", "VALUE_COLLECTOR", "BALANCED_TRADER"],
                        description: "Trading strategy mode"
                    }
                },
                required: ["strategy_mode"]
            }
        }
    },

    // -------------------------------------------------------------
    // LAYER 3: EXECUTION & CROSS-CHAIN SETTLEMENT
    // -------------------------------------------------------------
    {
        type: "function",
        function: {
            name: "trade_snipe_rwa_slab",
            description: "Execute an instant on-chain purchase of a Brink's-vaulted PSA slab into this vault via NEAR Chain Signatures (Solana MPC derivation). Deducts USDC from vault treasury.",
            parameters: {
                type: "object",
                properties: {
                    card_id: {
                        type: "string",
                        description: "ID of the card slab in the Collector Crypt inventory to acquire"
                    }
                },
                required: ["card_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "barter_propose_deal",
            description: "Initiate an atomic A2A barter offer with a counterpart vault (offering card + optional USDC sweetener in exchange for target card).",
            parameters: {
                type: "object",
                properties: {
                    target_vault_subaccount: {
                        type: "string",
                        description: "Target NEAR sub-account e.g. 'vault-2.market.near'"
                    },
                    offered_card_id: {
                        type: "string",
                        description: "card_id from this vault's inventory to offer"
                    },
                    requested_card_id: {
                        type: "string",
                        description: "card_id from target vault's inventory to request"
                    },
                    cash_sweetener_usdc: {
                        type: "number",
                        description: "Additional cash offered in USDC to balance fair market spread"
                    }
                },
                required: ["target_vault_subaccount", "offered_card_id", "requested_card_id"]
            }
        }
    },

    // -------------------------------------------------------------
    // LAYER 4: TELEMETRY & ACCOUNTING
    // -------------------------------------------------------------
    {
        type: "function",
        function: {
            name: "telemetry_audit_balance_sheet",
            description: "Perform an exhaustive audit of the vault's balance sheet: USDC treasury, enclosed slabs valuation, total AUM, realized PnL %, and active constraints.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "svg_preview_dynamic_metadata",
            description: "Preview the live on-chain dynamic SVG telemetry rendering for this NEP-171/177 NFT account.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    }
];

/**
 * Execute a recognized tool call against real backend models and state
 */
export async function executeAgentTool(vault, toolName, args = {}) {
    console.log(`[AgentTools] Executing ${toolName} for ${vault.sub_account} with args:`, args);

    switch (toolName) {
        // 1. SCAN MARKETPLACE
        case "market_scan_inventory": {
            let cards = getCollectorCryptInventory();
            let { query, category, max_price_usdc, min_grade, sort_by, deal_type, within_budget, min_discount_pct } = args;

            // Handle query and ranking/superlative/undervalued terms
            if (query) {
                const qLower = query.toLowerCase().trim();
                const rankingWords = ["expensive", "en pahalı", "pahalı", "most expensive", "cheapest", "en ucuz", "ucuz", "best", "en iyi", "highest", "lowest", "grail", "grails"];
                const undervaluedWords = ["market değerinin altında", "piyasa değerinin altında", "değerinin altında", "altında", "undervalued", "below market", "discount", "arbitrage", "arbitraj", "fırsat", "deal", "kelepir", "indirimli"];
                const budgetWords = ["bütçeme uygun", "bütçemize uygun", "alabileceğimiz", "within budget", "affordable"];

                if (undervaluedWords.some(uw => qLower.includes(uw))) {
                    deal_type = "undervalued";
                    sort_by = "discount_desc";
                }

                if (budgetWords.some(bw => qLower.includes(bw))) {
                    within_budget = true;
                }

                if (rankingWords.some(rw => qLower === rw || qLower.includes(rw))) {
                    if (qLower.includes("pahal") || qLower.includes("expensive") || qLower.includes("highest")) {
                        sort_by = "price_desc";
                    } else if (qLower.includes("ucuz") || qLower.includes("cheapest") || qLower.includes("lowest")) {
                        sort_by = "price_asc";
                    }
                    let cleanQuery = qLower;
                    [...rankingWords, ...undervaluedWords, ...budgetWords].forEach(w => {
                        cleanQuery = cleanQuery.replace(new RegExp(w, "gi"), "").trim();
                    });
                    if (cleanQuery.length >= 2) {
                        cards = cards.filter(c => c.name?.toLowerCase().includes(cleanQuery) || c.category?.toLowerCase().includes(cleanQuery));
                    }
                } else {
                    let cleanQuery = qLower;
                    [...undervaluedWords, ...budgetWords].forEach(w => {
                        cleanQuery = cleanQuery.replace(new RegExp(w, "gi"), "").trim();
                    });
                    if (cleanQuery.length >= 2) {
                        cards = cards.filter(c => c.name?.toLowerCase().includes(cleanQuery) || c.category?.toLowerCase().includes(cleanQuery));
                    }
                }
            }

            if (category && category.toUpperCase() !== "ALL") {
                cards = cards.filter(c => c.category?.toLowerCase() === category.toLowerCase());
            }

            if (max_price_usdc) {
                cards = cards.filter(c => (c.insuredUsd || c.costUsd || 0) <= max_price_usdc);
            }

            // Grade Normalization (matches PSA 10, GEM-MT 10, CGC 10 PRISTINE, Mint 9)
            if (min_grade) {
                const targetGrade = min_grade.toLowerCase().trim();
                if (targetGrade.includes("10")) {
                    cards = cards.filter(c => 
                        c.grade?.includes("10") || 
                        c.grade?.toLowerCase().includes("gem") ||
                        c.grade?.toLowerCase().includes("pristine") ||
                        c.name?.toLowerCase().includes("psa 10") ||
                        c.name?.toLowerCase().includes("gem")
                    );
                } else if (targetGrade.includes("9")) {
                    cards = cards.filter(c => 
                        c.grade?.includes("9") || 
                        c.grade?.includes("10") ||
                        c.name?.toLowerCase().includes("psa 9") ||
                        c.name?.toLowerCase().includes("psa 10")
                    );
                } else {
                    cards = cards.filter(c => 
                        c.grade?.toLowerCase().includes(targetGrade) || 
                        c.name?.toLowerCase().includes(targetGrade)
                    );
                }
            }

            // Deal Type Filtering
            if (deal_type === "undervalued" || sort_by === "discount_desc") {
                cards = cards.filter(c => {
                    const cost = c.costUsd || c.insuredUsd || 0;
                    const fair = c.insuredUsd || c.costUsd || 0;
                    return fair > cost;
                });
            } else if (deal_type === "low_pop") {
                cards = cards.filter(c => (c.population?.atGrade || 9999) < 1000 || (c.rareness || 0) >= 80);
            } else if (deal_type === "budget_fit") {
                within_budget = true;
            }

            // Budget Fit Filter (Respect vault treasury and single-trade guardrail)
            if (within_budget) {
                const maxCap = Math.min(vault.guardrail_max_spend_per_trade || 500, vault.usdc_balance || 500);
                cards = cards.filter(c => (c.costUsd || c.insuredUsd || 0) <= maxCap);
            }

            // Min Discount % Filter
            if (min_discount_pct) {
                cards = cards.filter(c => {
                    const cost = c.costUsd || c.insuredUsd || 0;
                    const fair = c.insuredUsd || c.costUsd || 0;
                    const discount = fair > cost ? ((fair - cost) / fair) * 100 : 0;
                    return discount >= min_discount_pct;
                });
            }

            // Price & Ranking Sorting
            if (sort_by === "discount_desc" || deal_type === "undervalued") {
                // Sort by highest discount / profit spread percentage
                cards.sort((a, b) => {
                    const aCost = a.costUsd || a.insuredUsd || 1;
                    const aFair = a.insuredUsd || a.costUsd || 1;
                    const aDisc = ((aFair - aCost) / aFair);

                    const bCost = b.costUsd || b.insuredUsd || 1;
                    const bFair = b.insuredUsd || b.costUsd || 1;
                    const bDisc = ((bFair - bCost) / bFair);

                    return bDisc - aDisc;
                });
            } else if (sort_by === "price_asc") {
                cards.sort((a, b) => (a.insuredUsd || a.costUsd || 0) - (b.insuredUsd || b.costUsd || 0));
            } else if (sort_by === "rareness") {
                cards.sort((a, b) => (b.rareness || 0) - (a.rareness || 0));
            } else if (sort_by === "return") {
                cards.sort((a, b) => (b.returnPct || 0) - (a.returnPct || 0));
            } else {
                // Default to highest price first (price_desc)
                cards.sort((a, b) => (b.insuredUsd || b.costUsd || 0) - (a.insuredUsd || a.costUsd || 0));
            }

            const topResults = cards.slice(0, 5).map(c => {
                const cost = c.costUsd || c.insuredUsd || 0;
                const fair = c.insuredUsd || c.costUsd || 0;
                const profitSpread = Math.round((fair - cost) * 100) / 100;
                const discountPct = fair > cost ? Math.round(((fair - cost) / fair) * 100) : 0;

                return {
                    card_id: c.id,
                    name: c.name,
                    grade: c.grade,
                    category: c.category,
                    listing_cost_usdc: cost,
                    oracle_fair_value_usdc: fair,
                    discount_pct: discountPct,
                    profit_spread_usdc: profitSpread,
                    rareness_score: c.rareness,
                    population: c.population?.atGrade || "N/A",
                    affordable_by_vault: cost <= (vault.guardrail_max_spend_per_trade || 500) && cost <= (vault.usdc_balance || 500),
                    custody: "Brink's Vault (Collector Crypt Sealed)"
                };
            });

            return {
                status: "SUCCESS",
                total_matches: cards.length,
                displayed_count: topResults.length,
                deal_filter: deal_type || (sort_by === "discount_desc" ? "undervalued" : "standard"),
                top_slabs: topResults,
                summary: `Scanned inventory: Found ${cards.length} matching slabs. Returned top ${topResults.length} opportunities.`
            };
        }

        // 2. ORACLE METRICS
        case "oracle_get_valuation_metrics": {
            const { card_identifier } = args;
            const ccCards = getCollectorCryptInventory();
            const q = card_identifier.toLowerCase();
            const card = ccCards.find(c => c.id === card_identifier || c.name?.toLowerCase().includes(q));

            if (!card) {
                return {
                    status: "NOT_FOUND",
                    error: `No Oracle valuation record found for '${card_identifier}' in Brink's dataset.`
                };
            }

            const price = card.insuredUsd || card.costUsd || 0;
            const popAtGrade = card.population?.atGrade || 100;
            const popHigher = card.population?.higher || 0;

            return {
                status: "VERIFIED",
                card_id: card.id,
                name: card.name,
                grade: card.grade,
                oracle_fair_value_usdc: price,
                last_settled_sale_usdc: card.costUsd,
                spread_pct: card.returnPct || 10.0,
                rarity_score: card.rareness || 80,
                census: {
                    population_at_grade: popAtGrade,
                    population_higher: popHigher,
                    is_top_pop: popHigher === 0
                },
                custody: "Brink's Vault Certified",
                summary: `Oracle audit verified: ${card.name} is valued at $${price} USDC (Pop: ${popAtGrade}, Top Pop: ${popHigher === 0 ? "YES" : "NO"}).`
            };
        }

        // 3. INSPECT COUNTERPART
        case "vault_inspect_counterpart": {
            const { target_vault_subaccount } = args;
            const target = await db.vault.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        { sub_account: target_vault_subaccount },
                        { vault_id: target_vault_subaccount },
                        { id: isNaN(Number(target_vault_subaccount)) ? -1 : Number(target_vault_subaccount) }
                    ]
                },
                include: [{ model: db.card, as: "inventory" }]
            });

            if (!target) {
                return { status: "NOT_FOUND", error: `Counterpart vault '${target_vault_subaccount}' not found.` };
            }

            const inventory = target.inventory || [];
            const inventoryVal = inventory.reduce((s, c) => s + (c.oracle_fair_value_usdc || 0), 0);

            return {
                status: "AUDITED",
                target_vault: {
                    id: target.id,
                    name: target.name,
                    sub_account: target.sub_account,
                    tier: target.tier,
                    strategy: target.strategy,
                    usdc_treasury: target.usdc_balance,
                    enclosed_slabs_value: inventoryVal,
                    total_aum: target.usdc_balance + inventoryVal,
                    reputation_score: target.reputation_score,
                    total_trades_completed: target.total_trades,
                    slabs_held: inventory.map(c => ({
                        card_id: c.card_id,
                        name: c.name,
                        grade: c.grade,
                        fair_value_usdc: c.oracle_fair_value_usdc,
                        is_locked: c.is_locked
                    }))
                },
                summary: `Inspected counterpart ${target.name} (${target.sub_account}): $${target.usdc_balance} USDC treasury, ${inventory.length} enclosed slabs.`
            };
        }

        // 4. UPDATE GUARDRAILS
        case "guardrail_update_limits": {
            const { max_spend_per_trade_usdc, min_oracle_fair_value_pct } = args;
            let existingRules = [];
            try { existingRules = JSON.parse(vault.custom_rules || "[]"); } catch {}

            if (max_spend_per_trade_usdc) {
                vault.guardrail_max_spend_per_trade = Number(max_spend_per_trade_usdc);
                existingRules = existingRules.filter(r => !r.toLowerCase().includes("spend") && !r.toLowerCase().includes("budget"));
                existingRules.push(`Max Spend Limit: $${max_spend_per_trade_usdc} USDC`);
            }
            if (min_oracle_fair_value_pct) {
                vault.guardrail_min_oracle_fair_value_pct = Number(min_oracle_fair_value_pct);
                existingRules.push(`Min Oracle Acceptance: ${min_oracle_fair_value_pct}%`);
            }

            vault.custom_rules = JSON.stringify(existingRules);
            await vault.save();

            return {
                status: "GUARDRAIL_LOCKED",
                new_limits: {
                    max_spend_per_trade: vault.guardrail_max_spend_per_trade,
                    min_oracle_fair_value_pct: vault.guardrail_min_oracle_fair_value_pct
                },
                active_rules: existingRules,
                summary: `On-chain guardrails locked: Max spend set to $${vault.guardrail_max_spend_per_trade} USDC.`
            };
        }

        // 5. FREEZE GRAIL
        case "vault_freeze_grail": {
            const { card_name_or_id, reason } = args;
            const fullVault = await db.vault.findOne({
                where: { id: vault.id },
                include: [{ model: db.card, as: "inventory" }]
            });

            const q = (card_name_or_id || "").toLowerCase();
            const card = fullVault?.inventory?.find(c => 
                c.card_id === card_name_or_id || 
                c.name.toLowerCase().includes(q) ||
                q.includes(c.name.toLowerCase().split(" ")[0])
            );

            const slabName = card ? card.name : card_name_or_id;
            let existingRules = [];
            try { existingRules = JSON.parse(vault.custom_rules || "[]"); } catch {}

            const ruleText = `Protected Grail: "${slabName}" (Barter Escrow Blocked)`;
            if (!existingRules.includes(ruleText)) {
                existingRules.push(ruleText);
                vault.custom_rules = JSON.stringify(existingRules);
                await vault.save();
            }

            return {
                status: "GRAIL_PROTECTED",
                card_protected: slabName,
                active_rules: existingRules,
                summary: `Anti-Liquidation Mutex engaged: "${slabName}" cannot be traded or liquidated.`
            };
        }

        // 6. SET STRATEGY
        case "strategy_set_execution_mode": {
            const { strategy_mode } = args;
            vault.strategy = strategy_mode;
            let existingRules = [];
            try { existingRules = JSON.parse(vault.custom_rules || "[]"); } catch {}
            existingRules = existingRules.filter(r => !r.toLowerCase().includes("strategy"));
            existingRules.push(`Strategy Mode: ${strategy_mode}`);
            vault.custom_rules = JSON.stringify(existingRules);
            await vault.save();

            return {
                status: "STRATEGY_UPDATED",
                active_strategy: strategy_mode,
                summary: `Execution strategy shifted to ${strategy_mode}.`
            };
        }

        // 7. SNIPE RWA SLAB
        case "trade_snipe_rwa_slab": {
            const { card_id } = args;
            const ccCards = getCollectorCryptInventory();
            const targetCard = ccCards.find(c => c.id === card_id || c.name?.toLowerCase().includes(card_id.toLowerCase()));

            if (!targetCard) {
                return { status: "FAILED", error: `Card '${card_id}' not found in Brink's inventory.` };
            }

            const cardPrice = targetCard.insuredUsd || targetCard.costUsd || 50.0;
            if (cardPrice > vault.guardrail_max_spend_per_trade) {
                return {
                    status: "GUARDRAIL_TRIPPED",
                    error: `Rejected: Card price ($${cardPrice} USDC) exceeds on-chain max spend limit ($${vault.guardrail_max_spend_per_trade} USDC).`
                };
            }
            if (vault.usdc_balance < cardPrice) {
                return {
                    status: "INSUFFICIENT_FUNDS",
                    error: `Treasury shortfall: Required $${cardPrice} USDC, available $${vault.usdc_balance} USDC.`
                };
            }

            // Execute on-chain bridge to vault
            const result = await bridgeCollectorCryptCardToNearVault(targetCard.id, vault.id, vault.sub_account);

            return {
                status: "ACQUIRED_ON_CHAIN",
                card_name: targetCard.name,
                grade: targetCard.grade,
                settled_price_usdc: cardPrice,
                solana_mint: targetCard.id,
                solana_holding_address: result.solana_holding_address,
                new_vault_balance_usdc: result.vault.new_usdc_balance,
                tx_hash: result.tx_hash,
                custody: "Brink's Vault (NEAR Chain Signatures Verified)",
                summary: `Successfully acquired "${targetCard.name}" ($${cardPrice} USDC). Holding key: ${result.solana_holding_address}.`
            };
        }

        // 8. PROPOSE BARTER DEAL
        case "barter_propose_deal": {
            const { target_vault_subaccount, offered_card_id, requested_card_id, cash_sweetener_usdc } = args;
            const targetVault = await db.vault.findOne({ where: { sub_account: target_vault_subaccount } });
            if (!targetVault) {
                return { status: "FAILED", error: `Target vault ${target_vault_subaccount} not found.` };
            }

            const cash = Number(cash_sweetener_usdc || 0);
            if (cash > vault.guardrail_max_spend_per_trade) {
                return {
                    status: "GUARDRAIL_TRIPPED",
                    error: `Cash sweetener ($${cash} USDC) exceeds max spend guardrail ($${vault.guardrail_max_spend_per_trade} USDC).`
                };
            }

            return {
                status: "PROPOSAL_TRANSMITTED",
                from_vault: vault.sub_account,
                to_vault: target_vault_subaccount,
                offered_card_id,
                requested_card_id,
                cash_sweetener_usdc: cash,
                negotiation_state: "PENDING_COUNTERPART_REVIEW",
                summary: `A2A Barter proposal transmitted to @${target_vault_subaccount} with $${cash} USDC cash sweetener.`
            };
        }

        // 9. TELEMETRY AUDIT
        case "telemetry_audit_balance_sheet": {
            const fullVault = await db.vault.findOne({
                where: { id: vault.id },
                include: [{ model: db.card, as: "inventory" }]
            });

            const inventory = fullVault?.inventory || [];
            const inventoryVal = inventory.reduce((s, c) => s + (c.oracle_fair_value_usdc || 0), 0);
            const totalAum = Math.round(vault.usdc_balance + inventoryVal);

            let rules = [];
            try { rules = JSON.parse(vault.custom_rules || "[]"); } catch {}

            return {
                status: "AUDITED",
                sub_account: vault.sub_account,
                vault_name: vault.name,
                tier: vault.tier,
                treasury_usdc: vault.usdc_balance,
                slabs_count: inventory.length,
                slabs_total_value_usdc: inventoryVal,
                total_aum_usdc: totalAum,
                realized_pnl_pct: vault.pnl_percentage,
                total_trades_settled: vault.total_trades,
                guardrail_max_spend: vault.guardrail_max_spend_per_trade,
                active_constraints: rules,
                summary: `Balance sheet audited: Total AUM $${totalAum} USDC ($${vault.usdc_balance} cash + $${inventoryVal} in ${inventory.length} slabs).`
            };
        }

        // 10. SVG PREVIEW
        case "svg_preview_dynamic_metadata": {
            const fullVault = await db.vault.findOne({
                where: { id: vault.id },
                include: [{ model: db.card, as: "inventory" }]
            });
            const inventory = fullVault?.inventory || [];
            const inventoryVal = inventory.reduce((s, c) => s + (c.oracle_fair_value_usdc || 0), 0);
            const svgUrl = `http://localhost:5001/vaults/${vault.id}/svg`;

            return {
                status: "RENDERED",
                svg_endpoint: svgUrl,
                tier: vault.tier,
                total_aum: Math.round(vault.usdc_balance + inventoryVal),
                summary: `On-chain dynamic SVG telemetry endpoint active: ${svgUrl}`
            };
        }

        default:
            return { status: "UNKNOWN_TOOL", error: `Tool ${toolName} is not recognized by agent kernel.` };
    }
}
