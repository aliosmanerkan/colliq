import db from "../model/model.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";

export class A2ASwarmService {
    constructor(io = null) {
        this.io = io;
        this.isRunning = false;
    }

    setSocket(io) {
        this.io = io;
    }

    // Runs a single atomic A2A negotiation cycle between 2 eligible vaults
    async executeNegotiationCycle() {
        if (this.isRunning) return null;
        this.isRunning = true;

        let lockedVaults = [];
        try {
            // Find two available, unlocked vaults with inventory
            const vaults = await db.vault.findAll({
                where: { is_locked: false },
                include: [{ model: db.card, as: "inventory" }]
            });

            const eligibleVaults = vaults.filter(v => v.inventory && v.inventory.length > 0);
            if (eligibleVaults.length < 2) {
                this.isRunning = false;
                return { status: "SKIPPED", message: "Not enough unlocked vaults with inventory" };
            }

            // Shuffle and pick 2 distinct vaults
            const shuffled = eligibleVaults.sort(() => 0.5 - Math.random());
            const vaultA = shuffled[0];
            const vaultB = shuffled[1];

            // 1. FRONT-RUNNING LOCK (MUTEX)
            vaultA.is_locked = true;
            vaultA.lock_reason = `A2A_NEGOTIATION_${vaultB.vault_id}`;
            vaultB.is_locked = true;
            vaultB.lock_reason = `A2A_NEGOTIATION_${vaultA.vault_id}`;
            await vaultA.save();
            await vaultB.save();
            lockedVaults = [vaultA, vaultB];

            this.emitEvent("a2a_match_found", {
                vaultA: { id: vaultA.id, name: vaultA.name, sub_account: vaultA.sub_account },
                vaultB: { id: vaultB.id, name: vaultB.name, sub_account: vaultB.sub_account }
            });

            // 2. PICK TARGET CARDS FOR BARTER RESPECTING CUSTOM OWNER DIRECTIVES
            let rulesA = [];
            try { rulesA = JSON.parse(vaultA.custom_rules || "[]"); } catch {}
            let rulesB = [];
            try { rulesB = JSON.parse(vaultB.custom_rules || "[]"); } catch {}

            // Protected grail cards for Vault A (never offer protected slabs)
            const protectedA = rulesA.filter(r => r.includes("Korumalı") || r.includes("Protected")).map(r => r.toLowerCase());
            const eligibleInventoryA = vaultA.inventory.filter(c => !protectedA.some(p => p.includes(c.name.toLowerCase().split(" ")[0])));
            const candidateInventoryA = eligibleInventoryA.length > 0 ? eligibleInventoryA : vaultA.inventory;

            // Target hunt preferences of Vault A (prioritize cards matching owner directive)
            const huntRulesA = rulesA.filter(r => r.includes("Öncelikli Av") || r.includes("Hunt")).map(r => r.toLowerCase());
            let targetCardFromB = null;
            if (huntRulesA.length > 0) {
                targetCardFromB = vaultB.inventory.find(c => 
                    huntRulesA.some(h => 
                        (h.includes("pikachu") && c.name.toLowerCase().includes("pikachu")) ||
                        (h.includes("charizard") && c.name.toLowerCase().includes("charizard")) ||
                        (h.includes("one piece") && c.category.toLowerCase().includes("one piece")) ||
                        (h.includes("basketball") && c.category.toLowerCase().includes("basketball"))
                    )
                );
            }

            const cardFromA = candidateInventoryA[Math.floor(Math.random() * candidateInventoryA.length)];
            const cardFromB = targetCardFromB || vaultB.inventory[Math.floor(Math.random() * vaultB.inventory.length)];

            const fairValA = cardFromA.oracle_fair_value_usdc;
            const fairValB = cardFromB.oracle_fair_value_usdc;
            const valueDiff = fairValB - fairValA;

            const negotiationLog = [];
            let tradeApproved = false;
            let usdcFromA = 0;
            let usdcFromB = 0;

            const directiveNoteA = targetCardFromB ? ` [Hunting Target matched owner directive!]` : "";

            // ROUND 1: Vault A initiates offer
            const r1CashOffer = Math.max(0, Math.round(valueDiff * 0.85));
            negotiationLog.push({
                round: 1,
                speaker: vaultA.name,
                speaker_id: vaultA.sub_account,
                message: `Hey @${vaultB.sub_account}, I noticed your ${cardFromB.name} (${cardFromB.grade}). I offer my ${cardFromA.name} (${cardFromA.grade}) + $${r1CashOffer} USDC.${directiveNoteA} Deal?`,
                offer: { card_offered: cardFromA.name, card_requested: cardFromB.name, cash_offered_usdc: r1CashOffer }
            });

            this.emitEvent("a2a_round_update", { round: 1, log: negotiationLog[0] });

            // ROUND 2: Vault B evaluates & counters
            const r2CashRequired = Math.max(0, Math.round(valueDiff * 1.05));
            const exceedsGuardrail = r2CashRequired > vaultA.guardrail_max_spend_per_trade;

            if (valueDiff > 0 && r1CashOffer < (valueDiff * 0.7)) {
                negotiationLog.push({
                    round: 2,
                    speaker: vaultB.name,
                    speaker_id: vaultB.sub_account,
                    message: `Counter-offer: My ${cardFromB.name} is a high-pop grail. I need your ${cardFromA.name} + $${r2CashRequired} USDC to balance the fair-market spread.`,
                    offer: { counter_cash_usdc: r2CashRequired }
                });
            } else {
                negotiationLog.push({
                    round: 2,
                    speaker: vaultB.name,
                    speaker_id: vaultB.sub_account,
                    message: `Your valuation looks balanced with Oracle feed. If you meet me at $${Math.round(valueDiff)} USDC cash difference, we shake hands.`,
                    offer: { counter_cash_usdc: Math.round(valueDiff) }
                });
            }

            this.emitEvent("a2a_round_update", { round: 2, log: negotiationLog[1] });

            // ROUND 3: Final Agreement & Guardrail Check
            const settledCash = Math.max(0, Math.min(Math.round(valueDiff), vaultA.guardrail_max_spend_per_trade));
            
            // GUARDRAIL 1: Max spend check
            if (valueDiff > 0 && settledCash > vaultA.guardrail_max_spend_per_trade) {
                negotiationLog.push({
                    round: 3,
                    speaker: vaultA.name,
                    speaker_id: vaultA.sub_account,
                    message: `Deal rejected by on-chain guardrail: Required cash ($${settledCash}) exceeds max_spend_per_trade limit ($${vaultA.guardrail_max_spend_per_trade}). Aborting.`,
                    guardrail_tripped: "MAX_SPEND_PER_TRADE"
                });
                tradeApproved = false;
            } else {
                // GUARDRAIL 2: Minimum Fair Value % Check
                const netValueGainA = fairValB - (fairValA + settledCash);
                const netValueGainB = (fairValA + settledCash) - fairValB;

                if ((fairValA + settledCash) < (fairValB * (vaultB.guardrail_min_oracle_fair_value_pct / 100))) {
                    negotiationLog.push({
                        round: 3,
                        speaker: vaultB.name,
                        speaker_id: vaultB.sub_account,
                        message: `Deal rejected: Effective value received is below my min_oracle_fair_value guardrail (${vaultB.guardrail_min_oracle_fair_value_pct}%).`,
                        guardrail_tripped: "MIN_ORACLE_FAIR_VALUE"
                    });
                    tradeApproved = false;
                } else {
                    tradeApproved = true;
                    if (valueDiff > 0) {
                        usdcFromA = settledCash;
                        usdcFromB = 0;
                    } else {
                        usdcFromA = 0;
                        usdcFromB = Math.abs(settledCash);
                    }

                    negotiationLog.push({
                        round: 3,
                        speaker: "SYSTEM",
                        speaker_id: "consensus.market.near",
                        message: `🤝 AGREEMENT REACHED: Barter swap approved! [${cardFromA.name} + $${usdcFromA} USDC] ⇄ [${cardFromB.name} + $${usdcFromB} USDC]. Submitting atomic transaction...`
                    });
                }
            }

            this.emitEvent("a2a_round_update", { round: 3, log: negotiationLog[2] });

            let tradeRecord = null;

            // 3. EXECUTE ATOMIC INTERNAL LEDGER SWAP IF APPROVED
            if (tradeApproved) {
                const protocolFee = Math.round(((fairValA + fairValB) * 0.005) * 100) / 100; // 0.5% anti-wash fee
                const txHash = "0x" + crypto.randomBytes(32).toString("hex");

                // Transfer Card Ownership
                cardFromA.vault_id = vaultB.id;
                cardFromA.owner_account = vaultB.sub_account;
                await cardFromA.save();

                cardFromB.vault_id = vaultA.id;
                cardFromB.owner_account = vaultA.sub_account;
                await cardFromB.save();

                // Transfer USDC balances
                vaultA.usdc_balance = Math.round((vaultA.usdc_balance - usdcFromA + usdcFromB - (protocolFee / 2)) * 100) / 100;
                vaultB.usdc_balance = Math.round((vaultB.usdc_balance - usdcFromB + usdcFromA - (protocolFee / 2)) * 100) / 100;

                // Update Stats
                vaultA.total_trades += 1;
                vaultB.total_trades += 1;
                vaultA.unique_counterparties += 1;
                vaultB.unique_counterparties += 1;

                // Profit calculation
                const pnlA = fairValB - (fairValA + usdcFromA) + usdcFromB;
                const pnlB = fairValA - (fairValB + usdcFromB) + usdcFromA;
                vaultA.net_pnl_usdc += pnlA;
                vaultB.net_pnl_usdc += pnlB;

                vaultA.pnl_percentage = Math.round((vaultA.net_pnl_usdc / 1000.0) * 100 * 10) / 10;
                vaultB.pnl_percentage = Math.round((vaultB.net_pnl_usdc / 1000.0) * 100 * 10) / 10;

                // Tier progression
                this.checkAndUpdateTier(vaultA);
                this.checkAndUpdateTier(vaultB);

                tradeRecord = await db.trade.create({
                    trade_id: uuidv4(),
                    vault_a_id: vaultA.id,
                    vault_b_id: vaultB.id,
                    vault_a_name: vaultA.name,
                    vault_b_name: vaultB.name,
                    cards_from_a: [cardFromA.toJSON()],
                    cards_from_b: [cardFromB.toJSON()],
                    usdc_from_a: usdcFromA,
                    usdc_from_b: usdcFromB,
                    rounds_count: negotiationLog.length,
                    negotiation_log: negotiationLog,
                    status: "COMPLETED",
                    protocol_fee_usdc: protocolFee,
                    tx_hash: txHash,
                    near_block: 118492000 + Math.floor(Math.random() * 5000)
                });

                this.emitEvent("a2a_trade_settled", {
                    trade: tradeRecord,
                    vaultA: { id: vaultA.id, name: vaultA.name, pnl: vaultA.pnl_percentage, tier: vaultA.tier },
                    vaultB: { id: vaultB.id, name: vaultB.name, pnl: vaultB.pnl_percentage, tier: vaultB.tier }
                });
            } else {
                tradeRecord = await db.trade.create({
                    trade_id: uuidv4(),
                    vault_a_id: vaultA.id,
                    vault_b_id: vaultB.id,
                    vault_a_name: vaultA.name,
                    vault_b_name: vaultB.name,
                    cards_from_a: [cardFromA.toJSON()],
                    cards_from_b: [cardFromB.toJSON()],
                    usdc_from_a: 0,
                    usdc_from_b: 0,
                    rounds_count: negotiationLog.length,
                    negotiation_log: negotiationLog,
                    status: "REJECTED_GUARDRAIL",
                    protocol_fee_usdc: 0,
                    tx_hash: "none",
                    near_block: 118492000
                });

                this.emitEvent("a2a_trade_rejected", {
                    reason: "Guardrails tripped during round 3",
                    vaultA: vaultA.name,
                    vaultB: vaultB.name
                });
            }

            return tradeRecord;
        } catch (err) {
            console.error("A2A Cycle Error:", err);
            return null;
        } finally {
            // UNLOCK MUTEX
            for (const v of lockedVaults) {
                v.is_locked = false;
                v.lock_reason = null;
                await v.save();
            }
            this.isRunning = false;
        }
    }

    checkAndUpdateTier(vault) {
        if (vault.total_trades >= 40 && vault.pnl_percentage >= 30) {
            vault.tier = "LEGENDARY_DECK";
        } else if (vault.total_trades >= 25 && vault.pnl_percentage >= 20) {
            vault.tier = "WHALE_VAULT";
        } else if (vault.total_trades >= 10) {
            vault.tier = "CERTIFIED_MERCHANT";
        } else {
            vault.tier = "ROOKIE";
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
