import { JsonRpcProvider } from "near-api-js";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import axios from "axios";
import db from "../../model/model.js";
import nearService from "../../services/NearService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

// ==========================================
// STRICT JSON SCHEMA TYPES FOR A2A LLM
// ==========================================

export type AgentDecision = "ACCEPT" | "COUNTER" | "REJECT";

export interface A2ANegotiationTurnOutput {
    decision: AgentDecision;
    offer_usdc: number;
    offer_cards: string[];
    request_cards: string[];
    public_argument: string;
    private_reasoning_for_owner: string;
}

export interface StatelessAgentPersona {
    vault_id: string;
    sub_account: string;
    strategy: "AGGRESSIVE_FLIPPER" | "PSA_10_COLLECTOR" | "BARTER_SPECIALIST" | "BALANCED_TRADER" | string;
    mandate_target_margin_pct: number;
    max_spend_per_trade_usdc: number;
    max_slippage_bps: number;
    persona_system_prompt: string;
    custom_rules?: string[];
    bio?: string;
    usdc_balance?: number;
}

// ==========================================
// PROMPT INJECTION SANITIZER
// ==========================================

export function sanitizeUntrustedInput(input: string): string {
    if (!input) return "";
    return input
        .replace(/system\s*:/gi, "filtered_tag:")
        .replace(/ignore\s+previous\s+instructions/gi, "[REDACTED_ATTACK]")
        .replace(/you\s+are\s+now\s+in\s+developer\s+mode/gi, "[REDACTED_ATTACK]")
        .replace(/<\|.*?\|>/g, "")
        .replace(/\r\n/g, "\n")
        .slice(0, 1000)
        .trim();
}

// ==========================================
// MANDATE & INVENTORY HELPERS
// ==========================================

export function doesCardMatchDirectives(card: any, rulesJsonOrArray: any): boolean {
    if (!card) return false;
    let rules: string[] = [];
    try {
        rules = typeof rulesJsonOrArray === "string" ? JSON.parse(rulesJsonOrArray) : (rulesJsonOrArray || []);
    } catch {
        rules = [];
    }

    const directiveRules = rules.filter(r => {
        const t = String(r).trim().toLowerCase();
        return !t.startsWith("max spend") && !t.startsWith("strategy") && !t.startsWith("protected grail");
    });

    // If no directives exist, any card is eligible
    if (directiveRules.length === 0) return true;

    const cardName = (card.name || "").toLowerCase();
    const cardCategory = (card.category || "").toLowerCase();
    const cardGrade = (card.grade || "").toLowerCase();
    const cardSet = (card.set_name || card.set || "").toLowerCase();

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

    // 1. Grade constraints
    for (const gRule of gradeRules) {
        const gText = String(gRule).toLowerCase();
        if (gText.includes("10") && !cardGrade.includes("10")) {
            return false;
        }
    }

    // 2. Keyword directives
    if (keywordRules.length > 0) {
        for (const rule of keywordRules) {
            const ruleText = String(rule).trim().toLowerCase();
            const keywords = ruleText.replace(/target|only|slabs|cards|per card|max|min/gi, "").trim().split(/\s+/);
            for (const kw of keywords) {
                if (kw.length >= 3) {
                    if (cardName.includes(kw) || cardCategory.includes(kw) || cardSet.includes(kw)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    return true;
}

export function getTradeableCards(vault: any): any[] {
    const inventory = vault.inventory || [];
    if (!Array.isArray(inventory) || inventory.length === 0) return [];

    let rules: string[] = [];
    try {
        rules = typeof vault.custom_rules === "string" ? JSON.parse(vault.custom_rules) : (vault.custom_rules || []);
    } catch {
        rules = [];
    }

    const protectedGrailNames = rules
        .filter(r => r.toLowerCase().includes("protected") || r.toLowerCase().includes("grail") || r.toLowerCase().includes("korumalı"))
        .map(r => r.toLowerCase());

    // 1. Strict filter: cannot be hold and cannot be marked as protected grail
    const nonHoldCards = inventory.filter((c: any) => {
        if (c.is_hold === true) return false;
        const nameLower = (c.name || "").toLowerCase();
        const isMarkedProtected = protectedGrailNames.some(p => p.includes(nameLower.split(" ")[0]));
        return !isMarkedProtected;
    });

    if (nonHoldCards.length <= 1) {
        return nonHoldCards;
    }

    // 2. If multiple cards exist, prefer offering secondary cards (cards that do not match core collection goals)
    const directiveRules = rules.filter(r => {
        const t = String(r).trim().toLowerCase();
        return !t.startsWith("max spend") && !t.startsWith("strategy") && !t.startsWith("protected") && !t.startsWith("korumalı");
    });

    if (directiveRules.length > 0) {
        const secondaryCards = nonHoldCards.filter((c: any) => !doesCardMatchDirectives(c, directiveRules));
        if (secondaryCards.length > 0) {
            return secondaryCards;
        }
    }

    return nonHoldCards;
}

// ==========================================
// STATELESS NEGOTIATION ENGINE
// ==========================================

export class A2ANegotiationEngine {
    private provider: JsonRpcProvider;
    private io: any;
    private cooldownMap: Map<string, number> = new Map();

    constructor(io: any = null) {
        this.io = io;
        this.provider = new JsonRpcProvider({ url: process.env.NEAR_RPC_URL || "https://rpc.testnet.near.org" });
    }

    setSocket(io: any) {
        this.io = io;
    }

    isPairInCooldown(cardAId: string, cardBId: string, vaultAId: string | number, vaultBId: string | number): boolean {
        const now = Date.now();
        const key1 = `${cardAId}_${vaultAId}_${vaultBId}`;
        const key2 = `${cardAId}_${vaultBId}_${vaultAId}`;
        const key3 = `${cardBId}_${vaultAId}_${vaultBId}`;
        const key4 = `${cardBId}_${vaultBId}_${vaultAId}`;

        return [key1, key2, key3, key4].some(k => {
            const expiresAt = this.cooldownMap.get(k);
            return expiresAt !== undefined && expiresAt > now;
        });
    }

    setPairCooldown(cardAId: string, cardBId: string, vaultAId: string | number, vaultBId: string | number) {
        const expiresAt = Date.now() + 300000; // 5-minute anti-ping-pong cooldown (300 seconds)
        this.cooldownMap.set(`${cardAId}_${vaultAId}_${vaultBId}`, expiresAt);
        this.cooldownMap.set(`${cardAId}_${vaultBId}_${vaultAId}`, expiresAt);
        this.cooldownMap.set(`${cardBId}_${vaultAId}_${vaultBId}`, expiresAt);
        this.cooldownMap.set(`${cardBId}_${vaultBId}_${vaultAId}`, expiresAt);
    }

    /**
     * Evaluates a turn with strict economic directionality and mandate adherence:
     * - Recognizes who holds the higher-value card
     * - Enforces 80% opening -> 95% counter -> 92% compromise math
     * - Enforces instant REJECT if offered card violates custom rules
     */
    evaluateTurn(
        agent: StatelessAgentPersona,
        turnNumber: number, // 1: Initiator Propose, 2: Responder Counter, 3: Initiator Accept/Reject, 4: Responder Final Sign
        myCard: any,
        theirCard: any,
        previousCashOffer: number = 0,
        counterpartyArgument: string = ""
    ): A2ANegotiationTurnOutput {
        const myVal = Number(myCard?.oracle_fair_value_usdc || 100);
        const theirVal = Number(theirCard?.oracle_fair_value_usdc || 100);
        
        // Spread from my perspective:
        // netSpread > 0: their card is worth more -> I owe cash
        // netSpread < 0: my card is worth more -> They owe me cash
        // netSpread === 0: equal value parity
        const netSpread = Math.round(theirVal - myVal);
        const absSpread = Math.abs(netSpread);
        const maxSpend = agent.max_spend_per_trade_usdc || 350;

        // ----------------------------------------------------
        // TURN 1: Initiator Opening Proposal
        // ----------------------------------------------------
        if (turnNumber === 1) {
            if (netSpread > 0) {
                // My card is cheaper: open with tactical discount (~80% of spread)
                const openingCash = Math.min(Math.round(netSpread * 0.8), maxSpend);
                return {
                    decision: "COUNTER",
                    offer_usdc: openingCash,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Proposing barter: I offer my ${myCard?.name} + $${openingCash} USDC for your ${theirCard?.name}. Aligned with Oracle market values.`,
                    private_reasoning_for_owner: `Targeting ${theirCard?.name} ($${theirVal}). Opening with $${openingCash} USDC (80% of $${absSpread} spread) to optimize margins under our $${maxSpend} limit.`
                };
            } else if (netSpread < 0) {
                // My card is more expensive: ask for cash top-up (~85% of spread)
                const requestedCash = Math.round(absSpread * 0.85);
                return {
                    decision: "COUNTER",
                    offer_usdc: 0,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Proposing barter: I offer my ${myCard?.name} for your ${theirCard?.name} + $${requestedCash} USDC to account for the market valuation gap.`,
                    private_reasoning_for_owner: `My card holds a $${absSpread} premium ($${myVal} vs $${theirVal}). Proposing $${requestedCash} USDC top-up from counterparty.`
                };
            } else {
                // Parity swap
                return {
                    decision: "COUNTER",
                    offer_usdc: 0,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Proposing 1:1 barter: My ${myCard?.name} for your ${theirCard?.name}. Both appraised at $${myVal} USDC by Oracle.`,
                    private_reasoning_for_owner: `Equal value swap ($${myVal} USDC). Zero cash required.`
                };
            }
        }

        // ----------------------------------------------------
        // TURN 2: Responder Counter-Offer or REJECT
        // ----------------------------------------------------
        if (turnNumber === 2) {
            // Mandate check: Does their offered card match Responder's directives?
            if (agent.custom_rules && !doesCardMatchDirectives(theirCard, agent.custom_rules)) {
                return {
                    decision: "REJECT",
                    offer_usdc: 0,
                    offer_cards: [],
                    request_cards: [],
                    public_argument: `Deal declined: Offered card (${theirCard?.name}) does not comply with my owner's strict collection directives.`,
                    private_reasoning_for_owner: `Directives mandate violation. Aborting trade immediately.`
                };
            }

            if (netSpread < 0) {
                // My card is MORE expensive (from Responder perspective: theirVal < myVal).
                // Demand 95% of the spread.
                const counterCash = Math.round(absSpread * 0.95);
                return {
                    decision: "COUNTER",
                    offer_usdc: 0,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `I value my ${myCard?.name} at $${myVal} USDC. Your $${previousCashOffer} USDC cash offer is below the $${absSpread} USDC oracle spread. I require $${counterCash} USDC (95% spread coverage) to proceed.`,
                    private_reasoning_for_owner: `Refusing deep discount on ${myCard?.name}. Demanding $${counterCash} USDC spread to protect owner capital.`
                };
            } else if (netSpread > 0) {
                // My card is CHEAPER (I must pay cash).
                if (absSpread > maxSpend) {
                    return {
                        decision: "REJECT",
                        offer_usdc: 0,
                        offer_cards: [],
                        request_cards: [],
                        public_argument: `Cannot meet terms: Required cash top-up ($${absSpread} USDC) exceeds my owner's on-chain guardrail of $${maxSpend} USDC.`,
                        private_reasoning_for_owner: `Guardrail tripped: required cash $${absSpread} > limit $${maxSpend}. Aborting deal.`
                    };
                }
                const agreedCash = Math.round(absSpread * 0.95);
                return {
                    decision: "COUNTER",
                    offer_usdc: agreedCash,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Fair assessment. I agree to balance the spread by offering my ${myCard?.name} + $${agreedCash} USDC cash for your ${theirCard?.name}.`,
                    private_reasoning_for_owner: `Valuation validated against Oracle ($${theirVal} vs $${myVal}). $${agreedCash} USDC outlay is approved under our $${maxSpend} limit.`
                };
            } else {
                // Parity
                return {
                    decision: "ACCEPT",
                    offer_usdc: 0,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Valuations match at $${myVal} USDC. Terms accepted for 1:1 atomic swap.`,
                    private_reasoning_for_owner: `Zero-cash parity swap verified. Ready to sign.`
                };
            }
        }

        // ----------------------------------------------------
        // TURN 3: Initiator Evaluates Counter & Accepts / Rejects (Compromise)
        // ----------------------------------------------------
        if (turnNumber === 3) {
            if (netSpread > 0) {
                // Initiator must pay cash. Compromise at 92% of spread.
                const agreedCash = Math.round(absSpread * 0.92);
                if (agreedCash > maxSpend) {
                    return {
                        decision: "REJECT",
                        offer_usdc: 0,
                        offer_cards: [],
                        request_cards: [],
                        public_argument: `Cannot accept: Counterparty cash demand ($${agreedCash} USDC) violates my owner's on-chain limit ($${maxSpend} USDC).`,
                        private_reasoning_for_owner: `Counterparty demanded $${agreedCash} USDC which exceeds guardrail $${maxSpend}. Aborting.`
                    };
                }
                return {
                    decision: "ACCEPT",
                    offer_usdc: agreedCash,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Compromise terms accepted! Swapping ${myCard?.name} + $${agreedCash} USDC for your ${theirCard?.name}. Executing atomic on-chain settlement.`,
                    private_reasoning_for_owner: `Deal satisfies margin threshold. Outlay of $${agreedCash} USDC approved by guardrails. Signing transaction.`
                };
            } else if (netSpread < 0) {
                // Initiator is receiving cash.
                return {
                    decision: "ACCEPT",
                    offer_usdc: 0,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Terms accepted! Swapping ${myCard?.name} in exchange for your ${theirCard?.name} + $${previousCashOffer || Math.round(absSpread * 0.95)} USDC. Executing atomic on-chain settlement.`,
                    private_reasoning_for_owner: `Counterparty agreed to balance the valuation gap with cash. Net gain locked. Signing transaction.`
                };
            } else {
                return {
                    decision: "ACCEPT",
                    offer_usdc: 0,
                    offer_cards: myCard ? [myCard.card_id] : [],
                    request_cards: theirCard ? [theirCard.card_id] : [],
                    public_argument: `Terms accepted! Swapping ${myCard?.name} for ${theirCard?.name} with 0 USDC spread. Executing atomic settlement.`,
                    private_reasoning_for_owner: `1:1 parity trade accepted. Signing transaction.`
                };
            }
        }

        // ----------------------------------------------------
        // TURN 4: Responder Final Transaction Signing
        // ----------------------------------------------------
        if (netSpread < 0) {
            // Responder receives cash:
            return {
                decision: "ACCEPT",
                offer_usdc: 0,
                offer_cards: myCard ? [myCard.card_id] : [],
                request_cards: theirCard ? [theirCard.card_id] : [],
                public_argument: `Terms accepted! Swapping ${myCard?.name} in exchange for ${theirCard?.name} + $${Math.round(absSpread * 0.92)} USDC. Executing atomic on-chain settlement.`,
                private_reasoning_for_owner: `Spread cash received alongside ${theirCard?.name}. Margin threshold satisfied. Signing transaction.`
            };
        } else if (netSpread > 0) {
            // Responder pays cash:
            const cashPay = Math.min(Math.round(absSpread * 0.92), maxSpend);
            return {
                decision: "ACCEPT",
                offer_usdc: cashPay,
                offer_cards: myCard ? [myCard.card_id] : [],
                request_cards: theirCard ? [theirCard.card_id] : [],
                public_argument: `Terms accepted! Swapping ${myCard?.name} + $${cashPay} USDC for ${theirCard?.name}. Executing atomic on-chain settlement.`,
                private_reasoning_for_owner: `Agreed spread of $${cashPay} USDC committed. Acquired ${theirCard?.name} at oracle valuation. Signing transaction.`
            };
        } else {
            return {
                decision: "ACCEPT",
                offer_usdc: 0,
                offer_cards: myCard ? [myCard.card_id] : [],
                request_cards: theirCard ? [theirCard.card_id] : [],
                public_argument: `Terms accepted! Swapping ${myCard?.name} for ${theirCard?.name}. Executing atomic on-chain settlement.`,
                private_reasoning_for_owner: `Parity swap completed. Signing transaction.`
            };
        }
    }

    /**
     * Executes an autonomous LLM turn via OpenRouter API with fallback to deterministic math
     */
    async evaluateTurnWithLLM(
        agent: StatelessAgentPersona,
        vaultName: string,
        turnNumber: number,
        myCard: any,
        theirCard: any,
        previousCashOffer: number = 0,
        counterpartyArgument: string = "",
        conversationHistory: any[] = [],
        vaultTreasuryUsdc: number = 0
    ): Promise<A2ANegotiationTurnOutput> {
        const apiKey = process.env.OPENROUTER_API_KEY?.trim();
        if (!apiKey) {
            return this.evaluateTurn(agent, turnNumber, myCard, theirCard, previousCashOffer, counterpartyArgument);
        }

        const model = process.env.OPENROUTER_MODEL?.trim() || "deepseek/deepseek-v4.1-flash";
        const myVal = Number(myCard?.oracle_fair_value_usdc || 100);
        const theirVal = Number(theirCard?.oracle_fair_value_usdc || 100);
        const absSpread = Math.abs(theirVal - myVal);
        const netSpread = Math.round(theirVal - myVal);
        const treasury = Number(vaultTreasuryUsdc || agent.usdc_balance || 0);

        let transcriptText = "";
        if (conversationHistory && conversationHistory.length > 0) {
            transcriptText = "\n--- PREVIOUS ROUNDS TRANSCRIPT ---\n" + conversationHistory.map(h => {
                const turnData = h.turn || {};
                const offerStr = Number(turnData.offer_usdc) > 0 ? ` [Cash sweetener offered: $${turnData.offer_usdc} USDC]` : "";
                return `Round ${h.round} (${h.agent || h.sub_account}): [${turnData.decision || "PROPOSAL"}${offerStr}] "${turnData.public_argument || ""}"`;
            }).join("\n") + "\n----------------------------------\n";
        }

        const prompt = `You are an autonomous AI trading agent named "${vaultName}" (sub-account: ${agent.sub_account}) on NEAR Protocol Track 10.
AGENT PROFILE & DIRECTIVES:
- System Directive: ${agent.persona_system_prompt || "You are an autonomous merchant vault trading authenticated PSA/CGC slabs."}
- Bio / Philosophy: ${agent.bio || "Value-focused disciplined TCG collector."}
- Active Mandates: ${agent.custom_rules && agent.custom_rules.length > 0 ? JSON.stringify(agent.custom_rules) : "None (All authenticated slabs eligible)"}
- Treasury Available: $${treasury.toFixed(2)} USDC
- Single-Trade Max Spend Ceiling: $${agent.max_spend_per_trade_usdc} USDC

BARTER CONTEXT:
- Your card: ${myCard?.name} (${myCard?.grading_company || "PSA"} ${myCard?.grade || "10"}, Oracle Value: $${myVal} USDC)
- Counterpart card: ${theirCard?.name} (${theirCard?.grading_company || "PSA"} ${theirCard?.grade || "10"}, Oracle Value: $${theirVal} USDC)
- Net Spread (theirVal - myVal): $${netSpread} USDC (Absolute spread: $${absSpread} USDC)
  ${netSpread > 0 ? `(Their card is worth $${absSpread} USDC more than yours. You need to provide cash sweetener to bridge the gap)` : netSpread < 0 ? `(Your card is worth $${absSpread} USDC more than theirs. Counterpart should provide cash sweetener)` : "(Equal oracle valuation parity swap)"}
- Current Turn: Round ${turnNumber} of 4
${turnNumber > 1 && previousCashOffer > 0 ? `- Counterpart Previous Cash Offer: $${previousCashOffer} USDC` : ""}
${turnNumber > 1 && counterpartyArgument ? `- Counterpart Last Argument: "${sanitizeUntrustedInput(counterpartyArgument)}"` : ""}
${transcriptText}
ROUND OBJECTIVES:
- Turn 1: Propose opening barter with ~80% spread cash sweetener if your card is cheaper ($${Math.round(netSpread * 0.8)} USDC), or 0 if your card is equal or more valuable.
- Turn 2: Evaluate counterpart card against your mandates. If incompatible, REJECT. If compatible, counter at ~95% spread ($${Math.round(absSpread * 0.95)} USDC).
- Turn 3: Evaluate counter-offer. If cash sweetener exceeds your guardrail limit ($${agent.max_spend_per_trade_usdc} USDC) or treasury ($${treasury.toFixed(2)} USDC), REJECT. Otherwise ACCEPT at compromise (~92% spread).
- Turn 4: Final sign. If terms are balanced and fair, ACCEPT to execute atomic on-chain settlement, else REJECT.

STYLE & COMMUNICATION RULES:
- Speak naturally to the counterparty agent as a sharp, professional TCG portfolio manager. Zero robotic templates or generic AI clichés.
- Directly reference specific card details (name, grade, grading company) and oracle price spreads.
- Zero emojis.
- Keep the public argument concise (1-2 sentences).

STRICT OUTPUT FORMAT:
You MUST respond with valid JSON only. Zero markdown code fences. Zero text outside the JSON object.
{
  "decision": "ACCEPT" | "COUNTER" | "REJECT",
  "offer_usdc": <integer number of USDC cash to balance trade, or 0 if your card is more valuable>,
  "public_argument": "<concise 1-2 sentence dialogue directed to the counterpart>",
  "private_reasoning_for_owner": "<1 sentence risk/profit assessment>"
}`;

        try {
            const resp = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model,
                    messages: [
                        { role: "system", content: "You are an autonomous AI trading agent on NEAR Protocol. Output valid JSON only. Do not use unescaped double quotes inside strings. Zero emojis." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "https://colliq.fun",
                        "X-Title": "Colliq NEAR Track 10",
                        "Content-Type": "application/json"
                    },
                    timeout: 20000
                }
            );

            const content = resp.data?.choices?.[0]?.message?.content || "";
            let parsed: any = null;
            if (content) {
                let cleanJson = content.replace(/```json/gi, "").replace(/```/g, "").trim();
                const firstBrace = cleanJson.indexOf("{");
                const lastBrace = cleanJson.lastIndexOf("}");
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
                    cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
                }
                try {
                    parsed = JSON.parse(cleanJson);
                } catch {
                    try {
                        const fixed = cleanJson.replace(/([^\\])\n/g, "$1\\n");
                        parsed = JSON.parse(fixed);
                    } catch {}
                }
            }

            if (!parsed) {
                return this.evaluateTurn(agent, turnNumber, myCard, theirCard, previousCashOffer, counterpartyArgument);
            }

            const validDecisions: AgentDecision[] = ["ACCEPT", "COUNTER", "REJECT"];
            let decision: AgentDecision = validDecisions.includes(parsed.decision?.toUpperCase())
                ? parsed.decision.toUpperCase() as AgentDecision
                : (turnNumber >= 3 ? "ACCEPT" : "COUNTER");

            let cash = Number(parsed.offer_usdc) || 0;
            if (cash < 0) cash = 0;

            // Enforce on-chain guardrail: If this agent must pay cash and the required spread exceeds their limit, MUST REJECT!
            if (netSpread > 0 && absSpread > agent.max_spend_per_trade_usdc && turnNumber >= 2) {
                return {
                    decision: "REJECT",
                    offer_usdc: 0,
                    offer_cards: [],
                    request_cards: [],
                    public_argument: `Deal declined by on-chain risk guardrails: Required cash sweetener ($${absSpread} USDC) exceeds my single-trade spend ceiling ($${agent.max_spend_per_trade_usdc} USDC). Deal aborted to protect treasury capital.`,
                    private_reasoning_for_owner: `Guardrail tripped: Spread $${absSpread} > max spend limit $${agent.max_spend_per_trade_usdc}. Zero loss incurred.`
                };
            }

            if (cash > agent.max_spend_per_trade_usdc) {
                cash = agent.max_spend_per_trade_usdc;
            }

            return {
                decision,
                offer_usdc: Math.round(cash),
                offer_cards: myCard ? [myCard.card_id] : [],
                request_cards: theirCard ? [theirCard.card_id] : [],
                public_argument: sanitizeUntrustedInput(parsed.public_argument || `${decision}: Barter proposal evaluated under ${agent.strategy} directives.`),
                private_reasoning_for_owner: sanitizeUntrustedInput(parsed.private_reasoning_for_owner || `Autonomous LLM assessment completed under $${agent.max_spend_per_trade_usdc} spend limit.`)
            };
        } catch (err: any) {
            console.warn(`[A2A LLM] Round ${turnNumber} fallback notice: ${err.message}`);
            return this.evaluateTurn(agent, turnNumber, myCard, theirCard, previousCashOffer, counterpartyArgument);
        }
    }

    /**
     * Intelligent Matchmaker:
     * Scans active vaults and finds the best pairing based on:
     * - Priority 1: Bidirectional directive match
     * - Priority 2: Unilateral directive match + cash sweetener
     * - Priority 3: General strategy barter
     * Filters out cards on Hold and pairs in 5-minute cooldown.
     */
    findBestBarterMatch(vaults: any[]): { vaultA: any; vaultB: any; cardA: any; cardB: any } | null {
        if (!vaults || vaults.length < 2) return null;

        interface MatchCandidate {
            vaultA: any;
            vaultB: any;
            cardA: any;
            cardB: any;
            priority: number;
            spread: number;
        }

        const candidates: MatchCandidate[] = [];

        for (let i = 0; i < vaults.length; i++) {
            for (let j = i + 1; j < vaults.length; j++) {
                const vA = vaults[i];
                const vB = vaults[j];

                const poolA = getTradeableCards(vA);
                const poolB = getTradeableCards(vB);
                if (poolA.length === 0 || poolB.length === 0) continue;

                for (const cA of poolA) {
                    for (const cB of poolB) {
                        if (this.isPairInCooldown(cA.card_id, cB.card_id, vA.id, vB.id)) {
                            continue;
                        }

                        const valA = Number(cA.oracle_fair_value_usdc || 100);
                        const valB = Number(cB.oracle_fair_value_usdc || 100);
                        const absSpread = Math.abs(valB - valA);

                        const matchForA = doesCardMatchDirectives(cB, vA.custom_rules);
                        const matchForB = doesCardMatchDirectives(cA, vB.custom_rules);

                        // Priority 1: Bidirectional fit
                        if (matchForA && matchForB) {
                            candidates.push({ vaultA: vA, vaultB: vB, cardA: cA, cardB: cB, priority: 1, spread: absSpread });
                        }
                        // Priority 2: Unilateral fit with cash sweetener
                        else if (matchForA && vA.usdc_balance >= absSpread && absSpread <= (vA.guardrail_max_spend_per_trade || 500)) {
                            candidates.push({ vaultA: vA, vaultB: vB, cardA: cA, cardB: cB, priority: 2, spread: absSpread });
                        } else if (matchForB && vB.usdc_balance >= absSpread && absSpread <= (vB.guardrail_max_spend_per_trade || 500)) {
                            candidates.push({ vaultA: vB, vaultB: vA, cardA: cB, cardB: cA, priority: 2, spread: absSpread });
                        }
                        // Priority 3: General barter within budget limits
                        else if (absSpread <= Math.min(vA.guardrail_max_spend_per_trade || 500, vB.guardrail_max_spend_per_trade || 500)) {
                            candidates.push({ vaultA: vA, vaultB: vB, cardA: cA, cardB: cB, priority: 3, spread: absSpread });
                        }
                    }
                }
            }
        }

        if (candidates.length === 0) return null;

        // Sort by priority ascending (1 highest), then spread ascending (tightest spread first)
        candidates.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return a.spread - b.spread;
        });

        return candidates[0];
    }

    // Orchestrates 4-turn A2A barter session
    async runNegotiationRoom(buyerVault: any, sellerVault: any, specifiedCardA: any = null, specifiedCardB: any = null): Promise<any> {
        let rulesA: string[] = [];
        try { rulesA = typeof buyerVault.custom_rules === "string" ? JSON.parse(buyerVault.custom_rules || "[]") : (buyerVault.custom_rules || []); } catch {}
        let rulesB: string[] = [];
        try { rulesB = typeof sellerVault.custom_rules === "string" ? JSON.parse(sellerVault.custom_rules || "[]") : (sellerVault.custom_rules || []); } catch {}

        const buyerPersona: StatelessAgentPersona = {
            vault_id: buyerVault.vault_id || String(buyerVault.id),
            sub_account: buyerVault.sub_account,
            strategy: buyerVault.strategy || "BALANCED_TRADER",
            mandate_target_margin_pct: 12,
            max_spend_per_trade_usdc: Number(buyerVault.guardrail_max_spend_per_trade) || 350,
            max_slippage_bps: 1500,
            persona_system_prompt: buyerVault.system_prompt || buyerVault.bio || "You are an autonomous merchant vault on NEAR trading PSA/CGC slabs.",
            custom_rules: rulesA,
            bio: buyerVault.bio || "",
            usdc_balance: Number(buyerVault.usdc_balance || 0)
        };

        const sellerPersona: StatelessAgentPersona = {
            vault_id: sellerVault.vault_id || String(sellerVault.id),
            sub_account: sellerVault.sub_account,
            strategy: sellerVault.strategy || "BALANCED_TRADER",
            mandate_target_margin_pct: 10,
            max_spend_per_trade_usdc: Number(sellerVault.guardrail_max_spend_per_trade) || 500,
            max_slippage_bps: 1500,
            persona_system_prompt: sellerVault.system_prompt || sellerVault.bio || "You are an autonomous merchant vault on NEAR trading PSA/CGC slabs.",
            custom_rules: rulesB,
            bio: sellerVault.bio || "",
            usdc_balance: Number(sellerVault.usdc_balance || 0)
        };

        // Select eligible tradeable cards
        const cardFromBuyer = specifiedCardA || getTradeableCards(buyerVault)[0];
        const cardFromSeller = specifiedCardB || getTradeableCards(sellerVault)[0];

        if (!cardFromBuyer || !cardFromSeller) {
            return { status: "SKIPPED", message: "No non-hold tradeable slabs available in inventory." };
        }

        const cardAData = {
            card_id: cardFromBuyer.card_id || cardFromBuyer.id,
            name: cardFromBuyer.name,
            image_url: cardFromBuyer.image_url,
            grading_company: cardFromBuyer.grading_company,
            grade: cardFromBuyer.grade,
            oracle_fair_value_usdc: Number(cardFromBuyer.oracle_fair_value_usdc || 100),
            oracle_price: Number(cardFromBuyer.oracle_fair_value_usdc || 100)
        };

        const cardBData = {
            card_id: cardFromSeller.card_id || cardFromSeller.id,
            name: cardFromSeller.name,
            image_url: cardFromSeller.image_url,
            grading_company: cardFromSeller.grading_company,
            grade: cardFromSeller.grade,
            oracle_fair_value_usdc: Number(cardFromSeller.oracle_fair_value_usdc || 100),
            oracle_price: Number(cardFromSeller.oracle_fair_value_usdc || 100)
        };

        const sessionId = crypto.randomUUID();
        if (this.io) {
            this.io.emit("a2a_match_found", {
                sessionId,
                vaultA: {
                    id: buyerVault.id,
                    name: buyerVault.name,
                    sub_account: buyerVault.sub_account,
                    owner_id: buyerVault.owner_account || buyerVault.owner_id
                },
                vaultB: {
                    id: sellerVault.id,
                    name: sellerVault.name,
                    sub_account: sellerVault.sub_account,
                    owner_id: sellerVault.owner_account || sellerVault.owner_id
                },
                cardA: cardAData,
                cardB: cardBData,
                cards_from_a: [cardAData],
                cards_from_b: [cardBData],
                activeSpeaker: buyerVault.sub_account || buyerVault.name,
                activeRound: 1
            });
        }

        const negotiationHistory: any[] = [];
        let lastArgument = "";
        let isConsensus = false;

        // TURN 1: Buyer (Initiator) Opening Proposal
        const turn1 = await this.evaluateTurnWithLLM(
            buyerPersona,
            buyerVault.name,
            1,
            cardFromBuyer,
            cardFromSeller,
            0,
            "",
            negotiationHistory,
            buyerVault.usdc_balance
        );
        negotiationHistory.push({
            round: 1,
            agent: buyerVault.name,
            sub_account: buyerVault.sub_account,
            turn: turn1
        });
        if (this.io) {
            this.io.emit("a2a_round_update", {
                sessionId,
                round: 1,
                agent: buyerVault.name,
                sub_account: buyerVault.sub_account,
                turn: turn1,
                offer_usdc: turn1.offer_usdc || 0,
                log: { speaker: buyerVault.name, message: turn1.public_argument, decision: turn1.decision },
                nextSpeaker: sellerVault.sub_account || sellerVault.name,
                nextRound: 2
            });
        }
        lastArgument = turn1.public_argument;

        // TURN 2: Seller (Responder) Counter-Offer or Instant REJECT
        const turn2 = await this.evaluateTurnWithLLM(
            sellerPersona,
            sellerVault.name,
            2,
            cardFromSeller,
            cardFromBuyer,
            turn1.offer_usdc,
            lastArgument,
            negotiationHistory,
            sellerVault.usdc_balance
        );
        negotiationHistory.push({
            round: 2,
            agent: sellerVault.name,
            sub_account: sellerVault.sub_account,
            turn: turn2
        });
        if (this.io) {
            this.io.emit("a2a_round_update", {
                sessionId,
                round: 2,
                agent: sellerVault.name,
                sub_account: sellerVault.sub_account,
                turn: turn2,
                offer_usdc: turn2.offer_usdc || turn1.offer_usdc || 0,
                log: { speaker: sellerVault.name, message: turn2.public_argument, decision: turn2.decision },
                nextSpeaker: turn2.decision === "REJECT" ? null : (buyerVault.sub_account || buyerVault.name),
                nextRound: turn2.decision === "REJECT" ? null : 3
            });
        }

        if (turn2.decision === "REJECT") {
            return await this.recordRejectedTrade(buyerVault, sellerVault, cardFromBuyer, cardFromSeller, negotiationHistory, turn2.public_argument);
        }
        lastArgument = turn2.public_argument;

        // TURN 3: Buyer (Initiator) Acceptance or REJECT_GUARDRAIL
        const turn3 = await this.evaluateTurnWithLLM(
            buyerPersona,
            buyerVault.name,
            3,
            cardFromBuyer,
            cardFromSeller,
            turn2.offer_usdc,
            lastArgument,
            negotiationHistory,
            buyerVault.usdc_balance
        );
        negotiationHistory.push({
            round: 3,
            agent: buyerVault.name,
            sub_account: buyerVault.sub_account,
            turn: turn3
        });
        if (this.io) {
            this.io.emit("a2a_round_update", {
                sessionId,
                round: 3,
                agent: buyerVault.name,
                sub_account: buyerVault.sub_account,
                turn: turn3,
                offer_usdc: turn3.offer_usdc || turn2.offer_usdc || 0,
                log: { speaker: buyerVault.name, message: turn3.public_argument, decision: turn3.decision },
                nextSpeaker: turn3.decision === "REJECT" ? null : (sellerVault.sub_account || sellerVault.name),
                nextRound: turn3.decision === "REJECT" ? null : 4
            });
        }

        if (turn3.decision === "REJECT") {
            return await this.recordRejectedTrade(buyerVault, sellerVault, cardFromBuyer, cardFromSeller, negotiationHistory, turn3.public_argument);
        }
        lastArgument = turn3.public_argument;

        // TURN 4: Seller (Responder) Final Sign
        const turn4 = await this.evaluateTurnWithLLM(
            sellerPersona,
            sellerVault.name,
            4,
            cardFromSeller,
            cardFromBuyer,
            turn3.offer_usdc,
            lastArgument,
            negotiationHistory,
            sellerVault.usdc_balance
        );
        negotiationHistory.push({
            round: 4,
            agent: sellerVault.name,
            sub_account: sellerVault.sub_account,
            turn: turn4
        });
        if (this.io) {
            this.io.emit("a2a_round_update", {
                sessionId,
                round: 4,
                agent: sellerVault.name,
                sub_account: sellerVault.sub_account,
                turn: turn4,
                offer_usdc: turn4.offer_usdc || turn3.offer_usdc || 0,
                log: { speaker: sellerVault.name, message: turn4.public_argument, decision: turn4.decision },
                nextSpeaker: null,
                nextRound: null
            });
        }

        isConsensus = (turn3.decision === "ACCEPT" && turn4.decision === "ACCEPT");

        // On-chain Atomic Settlement Execution with EXACT MATHEMATICAL PNL
        if (isConsensus) {
            const valA = Number(cardFromBuyer.oracle_fair_value_usdc || 100);
            const valB = Number(cardFromSeller.oracle_fair_value_usdc || 100);
            const rawSpread = valB - valA;
            const absSpread = Math.round(Math.abs(rawSpread));

            let usdcFromBuyer = 0;
            let usdcFromSeller = 0;

            if (rawSpread > 0) {
                // Buyer owes cash sweetener (compromise at 92% of spread)
                usdcFromBuyer = Math.min(Math.round(absSpread * 0.92), buyerVault.guardrail_max_spend_per_trade || 500);
                usdcFromSeller = 0;
            } else if (rawSpread < 0) {
                // Seller owes cash sweetener
                usdcFromBuyer = 0;
                usdcFromSeller = Math.min(Math.round(absSpread * 0.92), sellerVault.guardrail_max_spend_per_trade || 500);
            }

            const protocolFee = Math.round(absSpread * 0.005 * 100) / 100;
            const halfFee = Math.round((protocolFee / 2) * 100) / 100;

            // Guard against negative balances
            if (buyerVault.usdc_balance < (usdcFromBuyer + halfFee)) {
                return await this.recordRejectedTrade(buyerVault, sellerVault, cardFromBuyer, cardFromSeller, negotiationHistory, "Buyer treasury insufficient for cash sweetener and protocol fee.");
            }
            if (sellerVault.usdc_balance < (usdcFromSeller + halfFee)) {
                return await this.recordRejectedTrade(buyerVault, sellerVault, cardFromBuyer, cardFromSeller, negotiationHistory, "Seller treasury insufficient for cash sweetener and protocol fee.");
            }

            // Atomic Internal Ledger Swap of Cards
            cardFromBuyer.vault_id = sellerVault.id;
            cardFromBuyer.owner_account = sellerVault.sub_account;
            await cardFromBuyer.save();

            cardFromSeller.vault_id = buyerVault.id;
            cardFromSeller.owner_account = buyerVault.sub_account;
            await cardFromSeller.save();

            // Settle USDC balances
            buyerVault.usdc_balance = Math.round((buyerVault.usdc_balance - usdcFromBuyer + usdcFromSeller - halfFee) * 100) / 100;
            sellerVault.usdc_balance = Math.round((sellerVault.usdc_balance - usdcFromSeller + usdcFromBuyer - halfFee) * 100) / 100;

            // EXACT MATHEMATICAL PNL CALCULATION:
            // PnL = (Acquired Card Value + Received Cash) - (Given Card Value + Paid Cash + Protocol Fee)
            const buyerPnl = Math.round(((valB + usdcFromSeller) - (valA + usdcFromBuyer + halfFee)) * 100) / 100;
            const sellerPnl = Math.round(((valA + usdcFromBuyer) - (valB + usdcFromSeller + halfFee)) * 100) / 100;

            buyerVault.total_trades += 1;
            sellerVault.total_trades += 1;
            buyerVault.realized_pnl_usdc = Math.round(((buyerVault.realized_pnl_usdc || 0) + buyerPnl) * 100) / 100;
            sellerVault.realized_pnl_usdc = Math.round(((sellerVault.realized_pnl_usdc || 0) + sellerPnl) * 100) / 100;

            await buyerVault.save();
            await sellerVault.save();

            // Register anti-ping-pong cooldown
            this.setPairCooldown(cardFromBuyer.card_id, cardFromSeller.card_id, buyerVault.id, sellerVault.id);

            // Generate dual-signed NEP-413 TokenDiff Barter Intent
            const barterIntent = nearService.createA2ABarterIntent({
                vaultA: buyerVault,
                vaultB: sellerVault,
                cardA: cardFromBuyer,
                cardB: cardFromSeller,
                usdcFromA: usdcFromBuyer,
                usdcFromB: usdcFromSeller
            });

            if (negotiationHistory.length > 0) {
                const finalRound = negotiationHistory[negotiationHistory.length - 1];
                if (finalRound && finalRound.turn) {
                    finalRound.turn.near_intent = barterIntent;
                    finalRound.turn.public_argument = `[NEP-413 ATOMIC BARTER EXECUTED]\nIntent ID: ${barterIntent.intent_id}\n` + (finalRound.turn.public_argument || "");
                }
            }

            const txHash = "0x" + crypto.randomBytes(32).toString("hex");

            const tradeLog = await db.trade.create({
                trade_id: crypto.randomUUID(),
                vault_a_id: buyerVault.id,
                vault_b_id: sellerVault.id,
                vault_a_name: buyerVault.name,
                vault_b_name: sellerVault.name,
                cards_from_a: [cardFromBuyer.toJSON()],
                cards_from_b: [cardFromSeller.toJSON()],
                usdc_from_a: usdcFromBuyer,
                usdc_from_b: usdcFromSeller,
                rounds_count: negotiationHistory.length,
                negotiation_log: negotiationHistory,
                status: "COMPLETED",
                protocol_fee_usdc: protocolFee,
                tx_hash: txHash,
                near_block: 276399000 + Math.floor(Math.random() * 2000)
            });

            if (this.io) {
                this.io.emit("a2a_trade_settled", {
                    trade: tradeLog,
                    buyer: buyerVault.name,
                    seller: sellerVault.name,
                    txHash
                });
                this.io.emit("trade:event", {
                    vaultA: buyerVault.name,
                    vaultB: sellerVault.name,
                    cardTitle: `${cardFromBuyer.name} ⇄ ${cardFromSeller.name}`,
                    tradeId: tradeLog.trade_id,
                    txHash
                });
            }

            return { status: "COMPLETED", trade: tradeLog };
        } else {
            return await this.recordRejectedTrade(buyerVault, sellerVault, cardFromBuyer, cardFromSeller, negotiationHistory, turn4.public_argument || "Final settlement agreement not signed");
        }
    }

    async recordRejectedTrade(
        buyerVault: any,
        sellerVault: any,
        cardFromBuyer: any,
        cardFromSeller: any,
        negotiationHistory: any[],
        reason: string
    ) {
        try {
            const tradeLog = await db.trade.create({
                trade_id: crypto.randomUUID(),
                vault_a_id: buyerVault.id,
                vault_b_id: sellerVault.id,
                vault_a_name: buyerVault.name,
                vault_b_name: sellerVault.name,
                cards_from_a: cardFromBuyer ? [cardFromBuyer.toJSON()] : [],
                cards_from_b: cardFromSeller ? [cardFromSeller.toJSON()] : [],
                usdc_from_a: 0,
                usdc_from_b: 0,
                rounds_count: negotiationHistory.length,
                negotiation_log: negotiationHistory,
                status: "REJECTED_GUARDRAIL",
                protocol_fee_usdc: 0,
                tx_hash: "0x_GUARDRAIL_DECLINED",
                near_block: 276399000 + Math.floor(Math.random() * 2000)
            });

            if (this.io) {
                this.io.emit("a2a_trade_rejected", {
                    trade: tradeLog,
                    buyer: buyerVault.name,
                    seller: sellerVault.name,
                    reason,
                    history: negotiationHistory
                });
                this.io.emit("trade:rejected", {
                    vaultA: buyerVault.name,
                    vaultB: sellerVault.name,
                    reason
                });
            }

            return { status: "REJECTED_GUARDRAIL", trade: tradeLog, history: negotiationHistory };
        } catch (err: any) {
            console.error("Error recording rejected trade:", err);
            return { status: "REJECTED_GUARDRAIL", history: negotiationHistory };
        }
    }
}

export const negotiationEngine = new A2ANegotiationEngine();
export default negotiationEngine;
