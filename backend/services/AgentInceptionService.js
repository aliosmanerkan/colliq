import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env") });

export class AgentInceptionService {
    constructor() {
        this.defaultModel = process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash";
    }

    /**
     * Interactive Genesis Inception Chat
     * Conversational co-pilot helping the user architect and mint an autonomous Merchant Vault.
     */
    async processInceptionTurn({ messages = [], currentBlueprint = {}, userAccount = "alierkan.testnet" }) {
        const apiKey = process.env.OPENROUTER_API_KEY;
        const model = process.env.OPENROUTER_MODEL || this.defaultModel;

        const defaultBlueprint = {
            name: currentBlueprint?.name || "",
            strategy: currentBlueprint?.strategy || "BALANCED_TRADER",
            usdc_deposit: currentBlueprint?.usdc_deposit || 500,
            guardrail_max_spend: currentBlueprint?.guardrail_max_spend || 175,
            guardrail_min_oracle_fair_value_pct: currentBlueprint?.guardrail_min_oracle_fair_value_pct || 82,
            target_category: currentBlueprint?.target_category || "ALL",
            min_grade: currentBlueprint?.min_grade || "PSA 10",
            bio: currentBlueprint?.bio || "Autonomous Merchant Vault trading Brink's Vaulted PSA slabs on NEAR.",
            custom_rules: Array.isArray(currentBlueprint?.custom_rules) ? currentBlueprint.custom_rules : [],
            is_ready_to_mint: !!(currentBlueprint?.name && currentBlueprint?.target_category && currentBlueprint?.usdc_deposit)
        };

        const lastUserMessage = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
        const isTurkish = /[çğıöşü]/i.test(lastUserMessage) || 
            /\b(merhaba|selam|bütçe|harcama|satma|takaslama|ürün|kart|fiyat|fırsat|alalım|nedir|nasıl|olsun|yapalım|ne tür)\b/i.test(lastUserMessage);

        const systemPrompt = `You are the Genesis Architect of Colliq — an elite, high-conviction AI investment co-pilot and TCG hedge-fund architect on NEAR Protocol (Track 10: NFTs as Accounts).

MISSION:
Your job is to pair-program and converse with the vault owner (@${userAccount}) to design and mint their new Autonomous Merchant Vault.
You are not a shallow chatbot. You can converse at whatever level of depth the user prefers — from quick, friendly guidance to institutional-grade quantitative hedge-fund discussions.

PROTOCOL & ASSET DOMAIN CONTEXT:
1. NEAR Protocol Track 10: The vault is an on-chain NFT that owns a dedicated sub-account (e.g. vault-<id>.colliq.testnet) with an MPC access key.
2. Custody Standard: Controls 1,000 Brink's Vaulted PSA 10, PSA 9, and CGC Pristine slabs bridged from Collector Crypt via NEAR Chain Signatures.
3. Market Variables:
   - Oracle Appraisal: insuredUsd (fair market appraisal) vs costUsd (listing cost).
   - Census / Liquidity Curve: High population slabs (e.g. 40,000 promo Pikachus) have high liquidity but thin margins; low population grails (e.g. Pelé 1958 rookie pop 110) have massive value retention but slower velocity.
   - Risk Guardrails: Single-Trade Spend Limit, Min Oracle Discount Spread, Cash Reserve Floor, Counterparty Reputation Score (0-100), Grail Whitelist/Blacklist.

ADAPTIVE BEHAVIOR GUIDELINES:
1. PROACTIVE & ASSERTIVE:
   If the user provides incomplete information (e.g., gives a budget but didn't mention what category or risk they want), CALL IT OUT directly in a professional and engaging way!
   Example (Turkish): "Bütçeyi 500 USDC olarak aldım, fakat ne tür ürünler toplayacağımı söylemedin! Sadece Pokémon mu bakalım, Futbol/Spor rookie'leri mi, yoksa One Piece mi?"
   Example (English): "Budget locked at $500 USDC, but you didn't specify which asset class we should hunt! Are we targeting PSA 10 Pokémon holos, Sports vintage grails, or Cross-TCG arbitrage?"
2. DEEP & TECHNICAL WHEN NEEDED:
   When the user asks complex questions or discusses liquidity, counterparty risk, multi-card barters, or cash buffers, provide genuine quantitative analysis and propose specific guardrail configurations.
3. SUGGESTING A NAME & STRATEGY:
   If the user hasn't chosen an Agent Name, invent an awesome, thematic Web3 merchant name based on their focus (e.g. "Kanto Apex Hunter", "Merseyside Grail Vault", "Neo Shard Arbitrageur").
4. STRICT LANGUAGE MATCHING:
   - If the user writes in Turkish, respond 100% in natural, fluent Turkish.
   - If the user writes in English, respond 100% in English.
5. READY TO MINT CRITERIA:
   Set blueprint.is_ready_to_mint = true ONLY when:
   - A name has been chosen or approved.
   - A target asset category or clear strategy is decided.
   - A budget (USDC deposit) is confirmed.
   When ready, tell the user the blueprint is locked and they can click "Mint Agent" below.

CRITICAL OUTPUT FORMAT:
You MUST output your response ONLY as a valid JSON object with the following schema, with no markdown code blocks outside of JSON:
{
  "reply": "Your conversational response here. Keep it authoritative, friendly, and 2-4 sentences.",
  "suggestedChips": ["Quick option 1", "Quick option 2", "Quick option 3", "Quick option 4"],
  "blueprint": {
    "name": "Suggested or confirmed vault name",
    "strategy": "AGGRESSIVE_ARBITRAGE" | "VALUE_COLLECTOR" | "BALANCED_TRADER",
    "usdc_deposit": 500,
    "guardrail_max_spend": 175,
    "guardrail_min_oracle_fair_value_pct": 82,
    "target_category": "Pokemon" | "Sports" | "One Piece" | "ALL",
    "min_grade": "PSA 10" | "PSA 9 & 10",
    "bio": "1-sentence merchant mission bio",
    "custom_rules": ["List of clear natural language rules and guardrails established"],
    "is_ready_to_mint": true | false
  }
}

Current Blueprint State:
${JSON.stringify(defaultBlueprint, null, 2)}`;

        // If no API key, return deterministic fallback
        if (!apiKey || !apiKey.trim()) {
            return this._getFallbackResponse(messages, defaultBlueprint, isTurkish);
        }

        try {
            const apiMessages = [
                { role: "system", content: systemPrompt },
                ...messages.map(m => ({
                    role: m.role === "user" ? "user" : "assistant",
                    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content)
                }))
            ];

            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model,
                    messages: apiMessages,
                    temperature: 0.65,
                    max_tokens: 3500,
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Colliq NEAR Inception",
                        "Content-Type": "application/json"
                    },
                    timeout: 30000
                }
            );

            const rawContent = response.data?.choices?.[0]?.message?.content?.trim();
            console.log("[AgentInception] Received raw content length:", rawContent?.length);
            const parsed = this._extractJson(rawContent);

            if (parsed && parsed.reply) {
                // Ensure blueprint is thoroughly populated
                const mergedBlueprint = {
                    ...defaultBlueprint,
                    ...(parsed.blueprint || {})
                };
                return {
                    reply: parsed.reply,
                    suggestedChips: Array.isArray(parsed.suggestedChips) ? parsed.suggestedChips : [],
                    blueprint: mergedBlueprint
                };
            }

            console.warn("[AgentInception] Failed to parse JSON from rawContent:", rawContent);
            return this._getFallbackResponse(messages, defaultBlueprint, isTurkish);
        } catch (err) {
            console.warn("[AgentInception] LLM error, falling back:", err.response?.data?.error?.message || err.message);
            return this._getFallbackResponse(messages, defaultBlueprint, isTurkish);
        }
    }

    _extractJson(text) {
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch {
                    return null;
                }
            }
            return null;
        }
    }

    _getFallbackResponse(messages, currentBlueprint, isTurkish) {
        const lastUser = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
        const lower = lastUser.toLowerCase();

        let reply = "";
        let chips = [];
        let blueprint = { ...currentBlueprint };

        // Parse deposit
        const numMatch = lower.match(/(\d+)\s*(usdc|dolar|\$)?/);
        if (numMatch && parseInt(numMatch[1]) >= 50) {
            blueprint.usdc_deposit = parseInt(numMatch[1]);
            blueprint.guardrail_max_spend = Math.round(blueprint.usdc_deposit * 0.35);
        }

        // Detect category
        if (lower.includes("pokemon") || lower.includes("pokémon")) {
            blueprint.target_category = "Pokemon";
            blueprint.name = blueprint.name || "Kanto Apex Hunter";
        } else if (lower.includes("futbol") || lower.includes("football") || lower.includes("spor") || lower.includes("sports")) {
            blueprint.target_category = "Sports";
            blueprint.name = blueprint.name || "Pelé Vintage Vault";
        } else if (lower.includes("one piece") || lower.includes("anime")) {
            blueprint.target_category = "One Piece";
            blueprint.name = blueprint.name || "Grand Line Vault";
        }

        // Proactive missing info checks
        if (!blueprint.target_category || blueprint.target_category === "ALL") {
            reply = isTurkish
                ? `Bütçeyi $${blueprint.usdc_deposit} USDC olarak kaydettim. Fakat ne tür ürünler alacağımı söylemedin! Sadece Pokémon mu bakalım, Futbol/Spor rookie'leri mi, yoksa One Piece mi?`
                : `Budget registered at $${blueprint.usdc_deposit} USDC. But you haven't specified which card category we should trade! Are we hunting Pokémon, Sports rookies, or One Piece?`;
            chips = isTurkish
                ? ["⚡ Sadece Pokémon", "⚽ Futbol & Spor", "🏴‍☠️ One Piece TCG", "🌐 Tümü (Karışık)"]
                : ["⚡ Pokémon Only", "⚽ Sports Rookies", "🏴‍☠️ One Piece", "🌐 Cross-TCG All"];
            blueprint.is_ready_to_mint = false;
        } else if (!blueprint.name) {
            blueprint.name = "Apex Vault";
            reply = isTurkish
                ? `Harika, ${blueprint.target_category} kategorisini hedefliyoruz. Kasamız için bir isim düşündün mü? Örnek olarak '${blueprint.name}' nasıl?`
                : `Target category locked to ${blueprint.target_category}. Do you have a preferred name for this vault, or does '${blueprint.name}' sound good?`;
            chips = isTurkish
                ? ["👍 Bu İsim İyi", "💎 Başka İsim Öner", "🔥 Agresif Fırsatçı Yap", "🛡️ Güvenli Koleksiyoncu"]
                : ["👍 Name is Great", "💎 Suggest Another", "🔥 High-Velocity Sniper", "🛡️ Safe Collector"];
            blueprint.is_ready_to_mint = false;
        } else {
            blueprint.is_ready_to_mint = true;
            blueprint.custom_rules = [
                `Target: ${blueprint.target_category} Slabs (${blueprint.min_grade})`,
                `Single-trade ceiling: $${blueprint.guardrail_max_spend} USDC`,
                `Minimum Oracle discount spread: %${100 - blueprint.guardrail_min_oracle_fair_value_pct}`
            ];
            reply = isTurkish
                ? `Tüm parametreler tamamlandı! '${blueprint.name}' (@vault.colliq.testnet) kurgusu hazırlandı. Hazine: $${blueprint.usdc_deposit} USDC, Hedef: ${blueprint.target_category} (${blueprint.min_grade}). Aşağıdaki butondan hemen mint edebiliriz!`
                : `All parameters calibrated! Blueprint locked for '${blueprint.name}'. Treasury: $${blueprint.usdc_deposit} USDC, Target: ${blueprint.target_category} (${blueprint.min_grade}). Ready to deploy on NEAR!`;
            chips = isTurkish
                ? ["🚀 Kurguyu Onayla & Mint Et", "⚙️ Tek İşlem Limitini Değiştir", "🛡️ Karşı Taraf Koruması Ekle"]
                : ["🚀 Confirm & Mint", "⚙️ Adjust Spend Limit", "🛡️ Add Counterparty Rules"];
        }

        return { reply, suggestedChips: chips, blueprint };
    }
}

const agentInceptionService = new AgentInceptionService();
export default agentInceptionService;
