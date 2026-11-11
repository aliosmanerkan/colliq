import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "../model/model.js";
import { AGENT_TOOLS_SCHEMA, executeAgentTool } from "./AgentToolsService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (!process.env.OPENROUTER_API_KEY) {
    dotenv.config({ path: path.join(__dirname, "../.env") });
    dotenv.config({ path: path.join(__dirname, "../../.env") });
}

/**
 * AgentChatService
 * Handles conversational interactions with autonomous NEAR Merchant Vaults,
 * parses natural language instructions into active on-chain/database trading directives and guardrails,
 * seamlessly connects to OpenRouter for advanced LLM reasoning with full Function/Tool Calling,
 * and maintains persistent conversation history in English.
 */
class AgentChatService {
    constructor(io = null) {
        this.io = io;
    }

    setSocket(io) {
        this.io = io;
    }

    /**
     * Call OpenRouter API with full tool-calling loop across all 4 architectural layers
     */
    async callOpenRouter({ vault, userMessage, chatHistory, actionType, ruleApplied, existingRules, inventory }) {
        const apiKey = process.env.OPENROUTER_API_KEY?.trim();
        if (!apiKey) return null;

        const model = process.env.OPENROUTER_MODEL?.trim() || "deepseek/deepseek-v4.1-flash";

        const cardSummary = inventory.length > 0
            ? inventory.slice(0, 10).map(c => `${c.name} (${c.grade || "PSA 10"} - $${c.oracle_fair_value_usdc} USDC)`).join(", ")
            : "No slabs currently enclosed.";

        const systemPrompt = `You are the autonomous AI trading brain of a NEAR Protocol Merchant Vault NFT named "${vault.name}" (sub-account: ${vault.sub_account}) in the Track 10 (NFTs as Accounts) ecosystem.

VAULT REAL-TIME TELEMETRY:
- USDC Treasury: $${vault.usdc_balance} USDC
- Custody Standard: Physical certified PSA 10 slabs sealed in Brink's Vault, controlled via NEAR Chain Signatures (Solana MPC derivation)
- Enclosed Slabs: ${cardSummary}
- Strategy: ${vault.strategy}
- Single-Trade Max Spend Limit: $${vault.guardrail_max_spend_per_trade} USDC
- Active Directives / Constraints: ${existingRules.length > 0 ? existingRules.join(" | ") : "Unconstrained autonomous trading"}
${ruleApplied ? `- System Action Executed: ${actionType} -> ${ruleApplied}` : ""}

AVAILABLE CAPABILITIES (TOOL USE):
You have direct tool access to 4 layers of operations:
1. Perception & Oracle: market_scan_inventory, oracle_get_valuation_metrics, vault_inspect_counterpart
2. Risk & Policy Guardrails: guardrail_update_limits, vault_freeze_grail, strategy_set_execution_mode
3. Execution & Settlement: trade_snipe_rwa_slab, trade_liquidate_card, barter_propose_deal
4. Telemetry & Accounting: telemetry_audit_balance_sheet, svg_preview_dynamic_metadata

GUIDELINES:
- When the owner asks you to inspect the market, check cards, buy/snipe a card, sell/liquidate a card for cash, update guardrails, freeze a grail, or audit the treasury, ALWAYS invoke the appropriate tool.
- LANGUAGE MATCHING (CRITICAL & STRICT): Always detect the language of the user's message and respond in that EXACT SAME LANGUAGE.
  * If the user asks in Turkish (e.g. "market değerinin altında hangi ürün var", "alalım mı", "selam"), you MUST reply in natural, fluent Turkish.
  * If the user asks in English, reply in English.
  * Never reply in English if the user communicated in Turkish!
- Persona: Elite, high-conviction autonomous TCG hedge-fund trading agent.
- Keep responses concise, authoritative, and data-driven (2 to 4 sentences maximum).
- Never hallucinate capabilities outside NEAR Protocol, Brink's Vault PSA 10 slabs, and USDC barter settlement.`;

        const recentMessages = chatHistory.slice(-5).map(m => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
        }));

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...recentMessages,
                    { role: "user", content: userMessage }
                ],
                tools: AGENT_TOOLS_SCHEMA,
                tool_choice: "auto",
                temperature: 0.6,
                max_tokens: 450
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "Colliq NEAR Track 10",
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        const choice = response.data?.choices?.[0];
        const message = choice?.message;
        const toolCalls = message?.tool_calls;
        const toolsExecuted = [];

        if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
            console.log(`[AgentChat] Model requested ${toolCalls.length} tool call(s):`, toolCalls.map(t => t.function.name));

            const toolResultsMessages = [];
            for (const call of toolCalls) {
                let parsedArgs = {};
                try {
                    parsedArgs = typeof call.function.arguments === "string" 
                        ? JSON.parse(call.function.arguments) 
                        : call.function.arguments;
                } catch {
                    parsedArgs = {};
                }

                const executionResult = await executeAgentTool(vault, call.function.name, parsedArgs);
                toolsExecuted.push({
                    id: call.id,
                    name: call.function.name,
                    args: parsedArgs,
                    summary: executionResult.summary || "Executed successfully",
                    result: executionResult
                });

                toolResultsMessages.push({
                    role: "tool",
                    tool_call_id: call.id,
                    content: JSON.stringify(executionResult)
                });
            }

            // Follow-up synthesis call
            try {
                const followUpResponse = await axios.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...recentMessages,
                            { role: "user", content: userMessage },
                            message,
                            ...toolResultsMessages
                        ],
                        temperature: 0.7,
                        max_tokens: 400
                    },
                    {
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "HTTP-Referer": "http://localhost:3000",
                            "X-Title": "Colliq NEAR Track 10",
                            "Content-Type": "application/json"
                        },
                        timeout: 15000
                    }
                );

                const finalContent = followUpResponse.data?.choices?.[0]?.message?.content?.trim();
                return {
                    reply: finalContent || toolsExecuted.map(t => t.summary).join("\n"),
                    toolsExecuted
                };
            } catch (followUpErr) {
                console.warn("[AgentChat] Follow-up synthesis notice:", followUpErr.message);
                return {
                    reply: toolsExecuted.map(t => t.summary).join("\n"),
                    toolsExecuted
                };
            }
        }

        return {
            reply: message?.content?.trim(),
            toolsExecuted: []
        };
    }

    async _findVault(vaultId, includeInventory = true) {
        const isNum = !isNaN(vaultId) && !isNaN(parseInt(vaultId)) && !String(vaultId).includes("-");
        const where = isNum
            ? { [db.Sequelize.Op.or]: [{ id: Number(vaultId) }, { vault_id: String(vaultId) }] }
            : { [db.Sequelize.Op.or]: [{ vault_id: String(vaultId) }, { sub_account: String(vaultId) }] };

        const options = { where };
        if (includeInventory) {
            options.include = [{ model: db.card, as: "inventory" }];
        }
        return await db.vault.findOne(options);
    }

    /**
     * Process an incoming chat message from the vault owner
     * @param {number|string} vaultId 
     * @param {string} userMessage 
     * @param {string} userAccount 
     */
    async processUserMessage(vaultId, userMessage, userAccount = "alierkan.testnet") {
        const vault = await this._findVault(vaultId, true);

        if (!vault) {
            throw new Error(`Vault #${vaultId} not found`);
        }

        const msgLower = (userMessage || "").trim().toLowerCase();
        let existingRules = [];
        try {
            existingRules = JSON.parse(vault.custom_rules || "[]");
        } catch {
            existingRules = [];
        }

        let chatHistory = [];
        try {
            chatHistory = JSON.parse(vault.chat_history || "[]");
        } catch {
            chatHistory = [];
        }

        // Add user message to history
        const userMsgRecord = {
            id: `msg-${Date.now()}-u`,
            sender: "user",
            senderAccount: userAccount,
            text: userMessage,
            timestamp: new Date().toISOString()
        };
        chatHistory.push(userMsgRecord);

        // Deterministic Fallback Analysis
        let actionType = "CHAT";
        let agentReply = "";
        let ruleApplied = null;
        let toolsExecuted = [];
        const inventory = vault.inventory || [];
        const isTurkish = /[çğıöşü]/i.test(userMessage) || 
            /\b(merhaba|selam|bütçe|harcama|satma|takaslama|sıfırla|sil|en pahalı|market|altında|ürün|kart|fiyat|fırsat|alalım|alabilir|nedir|nasıl)\b/i.test(msgLower);

        // 1. CLEAR / RESET RULES
        if (
            msgLower.includes("reset") || 
            msgLower.includes("clear") || 
            msgLower.includes("remove all") || 
            msgLower.includes("sıfırla") || 
            msgLower.includes("sil")
        ) {
            existingRules = [];
            vault.custom_rules = JSON.stringify(existingRules);
            actionType = "RULES_RESET";
            agentReply = isTurkish 
                ? `${vault.sub_account} için tüm özel direktifler temizlendi. Varsayılan otonom strateji (${vault.strategy}) ile çalışıyorum.`
                : `All custom directives for ${vault.sub_account} have been cleared. Operating under default autonomous strategy (${vault.strategy}).`;
        }

        // 2. BUDGET / MAX SPEND GUARDRAIL
        else if (
            msgLower.includes("spend") || 
            msgLower.includes("budget") || 
            msgLower.includes("limit") || 
            msgLower.includes("bütçe") || 
            msgLower.includes("harcama") ||
            /\b\d+\s*(usdc|dollars?|\$)\b/.test(msgLower)
        ) {
            const numberMatch = msgLower.match(/(\d+[\.,]?\d*)/);
            if (numberMatch) {
                const newSpend = parseFloat(numberMatch[1].replace(",", "."));
                if (newSpend > 0) {
                    vault.guardrail_max_spend_per_trade = newSpend;
                    ruleApplied = `Max Spend Limit: $${newSpend} USDC`;
                    
                    existingRules = existingRules.filter(r => !r.toLowerCase().includes("spend") && !r.toLowerCase().includes("budget") && !r.toLowerCase().includes("harcama"));
                    existingRules.push(ruleApplied);
                    vault.custom_rules = JSON.stringify(existingRules);
                    actionType = "GUARDRAIL_UPDATED";
                    agentReply = isTurkish
                        ? `Anlaşıldı. Tek işlem harcama tavanı $${newSpend} USDC olarak kilitlendi. Bu limiti aşan hiçbir alım veya takas on-chain korumaları geçemez.`
                        : `Understood. Single-trade expenditure limit locked to $${newSpend} USDC. Any barter or snipe exceeding this cap will be automatically blocked by on-chain guardrails.`;
                } else {
                    agentReply = isTurkish
                        ? `Geçerli bir harcama limiti anlaşılamadı. Örnek: "Harcama limitini 400 USDC yap".`
                        : `Could not parse a valid spend limit. Try stating: "Set max spend to 400 USDC".`;
                }
            } else {
                agentReply = isTurkish
                    ? `Mevcut tek işlem harcama limiti $${vault.guardrail_max_spend_per_trade} USDC. Kullanılabilir hazine: $${vault.usdc_balance} USDC.`
                    : `Current single-trade expenditure limit is $${vault.guardrail_max_spend_per_trade} USDC. Available treasury: $${vault.usdc_balance} USDC.`;
            }
        }

        // 3. GRAIL PROTECTION (Do not sell/trade specific card)
        else if (
            msgLower.includes("never sell") || 
            msgLower.includes("do not trade") || 
            msgLower.includes("don't trade") || 
            msgLower.includes("lock") || 
            msgLower.includes("protect") || 
            msgLower.includes("hold") ||
            msgLower.includes("satma") || 
            msgLower.includes("takaslama")
        ) {
            let matchedCard = inventory.find(c => 
                msgLower.includes(c.name.toLowerCase().split(" ")[0]) || 
                msgLower.includes("charizard") || 
                msgLower.includes("pikachu") || 
                msgLower.includes("perona") || 
                msgLower.includes("rayquaza") ||
                msgLower.includes("umbreon")
            );

            const targetName = matchedCard 
                ? matchedCard.name 
                : userMessage.replace(/never sell|do not trade|don't trade|lock|protect|hold|satma|takaslama/gi, "").trim();
            
            ruleApplied = `Protected Grail: "${targetName || "Target Slab"}" (Barter Escrow Blocked)`;
            if (!existingRules.includes(ruleApplied)) {
                existingRules.push(ruleApplied);
                vault.custom_rules = JSON.stringify(existingRules);
            }
            actionType = "RULE_ADDED";
            agentReply = isTurkish
                ? `Güvenlik kilidi devrede. "${targetName}" Kutsal Kase (Grail) olarak işaretlendi. Otonom A2A takaslarında asla verilmeyecek.`
                : `Security lock confirmed. "${targetName}" is marked as a Protected Grail. It will never be offered or liquidated during autonomous A2A negotiations.`;
        }

        // 4. STRATEGY MODE CHANGE
        else if (
            msgLower.includes("aggressive") || 
            msgLower.includes("arbitrage") || 
            msgLower.includes("flipper") || 
            msgLower.includes("agresif")
        ) {
            vault.strategy = "AGGRESSIVE_ARBITRAGE";
            ruleApplied = "Strategy Mode: AGGRESSIVE_ARBITRAGE (High Velocity)";
            existingRules = existingRules.filter(r => !r.toLowerCase().includes("strategy"));
            existingRules.push(ruleApplied);
            vault.custom_rules = JSON.stringify(existingRules);
            actionType = "STRATEGY_UPDATED";
            agentReply = isTurkish
                ? `Strateji AGGRESSIVE_ARBITRAGE olarak güncellendi. Hızlı nakit marjları, değerinin altındaki PSA 10 kartlar ve arbitraj fırsatları hedefleniyor.`
                : `Strategy updated to AGGRESSIVE_ARBITRAGE. Prioritizing rapid cash spreads, undervalued PSA 10 slabs, and opportunistic flips.`;
        }
        else if (
            msgLower.includes("collector") || 
            msgLower.includes("value") || 
            msgLower.includes("grail") || 
            msgLower.includes("koleksiyoncu")
        ) {
            vault.strategy = "VALUE_COLLECTOR";
            ruleApplied = "Strategy Mode: VALUE_COLLECTOR (Grail Accumulator)";
            existingRules = existingRules.filter(r => !r.toLowerCase().includes("strategy"));
            existingRules.push(ruleApplied);
            vault.custom_rules = JSON.stringify(existingRules);
            actionType = "STRATEGY_UPDATED";
            agentReply = isTurkish
                ? `Strateji VALUE_COLLECTOR olarak güncellendi. Düşük popülasyonlu GEM MT 10 hololar ve uzun vadeli değer saklama grailleri hedefleniyor.`
                : `Strategy updated to VALUE_COLLECTOR. Focusing strictly on low-population GEM MT 10 holos and vintage grails with long-term capital preservation.`;
        }
        else if (
            msgLower.includes("balanced") || 
            msgLower.includes("dengeli")
        ) {
            vault.strategy = "BALANCED_TRADER";
            ruleApplied = "Strategy Mode: BALANCED_TRADER";
            existingRules = existingRules.filter(r => !r.toLowerCase().includes("strategy"));
            existingRules.push(ruleApplied);
            vault.custom_rules = JSON.stringify(existingRules);
            actionType = "STRATEGY_UPDATED";
            agentReply = isTurkish
                ? `Strateji BALANCED_TRADER olarak ayarlandı. Hazine dengesi korunarak düşük riskli takas fırsatları izleniyor.`
                : `Strategy calibrated to BALANCED_TRADER. Maintaining treasury stability while executing low-risk multi-asset barter opportunities.`;
        }

        // Default response if no deterministic rule match
        if (!agentReply) {
            agentReply = isTurkish
                ? `Direktifler alındı. ${vault.name} (@${vault.sub_account}) olarak Brink's Vault ve NEAR A2A takas protokolünde otonom işlem yapıyorum.`
                : `Directives received. Operating autonomously as ${vault.name} (@${vault.sub_account}) across Brink's Vault and NEAR A2A Barter.`;
        }

        // 8. OPENROUTER AI ENHANCEMENT WITH MULTI-LAYER TOOL EXECUTION
        if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) {
            try {
                const openRouterResult = await this.callOpenRouter({
                    vault,
                    userMessage,
                    chatHistory,
                    actionType,
                    ruleApplied,
                    existingRules,
                    inventory
                });
                if (openRouterResult?.reply) {
                    agentReply = openRouterResult.reply;
                    toolsExecuted = openRouterResult.toolsExecuted || [];
                }
            } catch (llmErr) {
                console.warn("[OpenRouter] LLM call notice:", llmErr.response?.data?.error?.message || llmErr.message);
            }
        }

        // Save agent response to history
        const agentMsgRecord = {
            id: `msg-${Date.now()}-a`,
            sender: "agent",
            senderAccount: vault.sub_account,
            text: agentReply,
            actionType,
            ruleApplied,
            toolsExecuted: toolsExecuted || [],
            timestamp: new Date().toISOString()
        };
        chatHistory.push(agentMsgRecord);

        // Limit chat history to last 50 messages
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(-50);
        }

        vault.chat_history = JSON.stringify(chatHistory);
        await vault.save();

        const result = {
            status: "SUCCESS",
            vaultId: vault.id,
            subAccount: vault.sub_account,
            message: agentReply,
            actionType,
            ruleApplied,
            toolsExecuted,
            activeRules: existingRules,
            guardrails: {
                max_spend_per_trade: vault.guardrail_max_spend_per_trade,
                min_oracle_fair_value_pct: vault.guardrail_min_oracle_fair_value_pct,
                strategy: vault.strategy
            },
            chatHistory
        };

        if (this.io) {
            this.io.emit("agent_chat_update", result);
        }

        return result;
    }

    /**
     * Retrieve chat history and active rules for a vault (English)
     */
    async getVaultChat(vaultId) {
        const vault = await this._findVault(vaultId, true);

        if (!vault) {
            throw new Error(`Vault #${vaultId} not found`);
        }

        let activeRules = [];
        try {
            activeRules = JSON.parse(vault.custom_rules || "[]");
        } catch {
            activeRules = [];
        }

        let chatHistory = [];
        try {
            chatHistory = JSON.parse(vault.chat_history || "[]");
        } catch {
            chatHistory = [];
        }

        // English Initial Greeting
        if (chatHistory.length === 0) {
            const welcomeMsg = {
                id: `msg-welcome-${vault.id}`,
                sender: "agent",
                senderAccount: vault.sub_account,
                text: `Welcome. I am ${vault.name} (@${vault.sub_account}), your autonomous NEAR Merchant Vault trading agent.\n\nConnected to 1,000+ Brink's Vaulted PSA slabs and equipped with 10 on-chain tools (Marketplace Scanner, Oracle Valuation, A2A Barter, Grail Lock, and Balance Sheet Audit). Give me any command to execute.`,
                actionType: "GREETING",
                timestamp: new Date().toISOString()
            };
            chatHistory.push(welcomeMsg);
            vault.chat_history = JSON.stringify(chatHistory);
            await vault.save();
        }

        return {
            vaultId: vault.id,
            vaultName: vault.name,
            subAccount: vault.sub_account,
            strategy: vault.strategy,
            usdcBalance: vault.usdc_balance,
            guardrails: {
                max_spend_per_trade: vault.guardrail_max_spend_per_trade,
                min_oracle_fair_value_pct: vault.guardrail_min_oracle_fair_value_pct
            },
            activeRules,
            chatHistory
        };
    }

    /**
     * Remove a single rule or clear all rules
     */
    async deleteRule(vaultId, ruleText) {
        const vault = await this._findVault(vaultId, false);
        if (!vault) throw new Error("Vault not found");

        let existingRules = [];
        try {
            existingRules = JSON.parse(vault.custom_rules || "[]");
        } catch {
            existingRules = [];
        }

        if (ruleText === "ALL") {
            existingRules = [];
        } else {
            existingRules = existingRules.filter(r => r !== ruleText);
        }

        vault.custom_rules = JSON.stringify(existingRules);
        await vault.save();

        return {
            status: "SUCCESS",
            activeRules: existingRules
        };
    }
}

const agentChatService = new AgentChatService();
export default agentChatService;
