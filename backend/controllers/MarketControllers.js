import express from "express";
import axios from "axios";
import db from "../model/model.js";
import nearService from "../services/NearService.js";
import { 
    getCollectorCryptInventory, 
    bridgeCollectorCryptCardToNearVault, 
    fetchCollectorCryptMarketplace, 
    findCollectorCryptCardById 
} from "../services/CollectorCryptService.js";

const router = express.Router();

// GET live NEAR testnet network status from RPC
router.get("/near-status", async (req, res) => {
    try {
        const status = await nearService.getNetworkStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify testnet account
router.get("/verify-account/:accountId", async (req, res) => {
    try {
        const result = await nearService.verifyAccountExists(req.params.accountId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all RWA cards currently held in NEAR Merchant Vaults
router.get("/cards", async (req, res) => {
    try {
        const cards = await db.card.findAll({
            include: [{ model: db.vault, as: "vault", attributes: ["name", "sub_account", "tier"] }],
            order: [["oracle_fair_value_usdc", "DESC"]]
        });
        res.json({ cards });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET authentic Collector Crypt inventory (170k+ Live Solana Brink's & PWCC Vaults)
router.get("/collector-crypt", async (req, res) => {
    try {
        const { 
            search, 
            category, 
            gradingCompany, 
            grade, 
            sortBy, 
            orderBy, 
            cursor, 
            limit, 
            listedOnly 
        } = req.query;

        const result = await fetchCollectorCryptMarketplace({
            search,
            category,
            gradingCompany,
            grade,
            sortBy: sortBy || orderBy,
            cursor,
            limit: limit ? parseInt(limit, 10) : 48,
            listedOnly: listedOnly === "true" || listedOnly === true
        });

        res.json(result);
    } catch (err) {
        console.error("Marketplace fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Buy Collector Crypt Card and secure into a NEAR Merchant Vault
router.post("/collector-crypt/buy", async (req, res) => {
    try {
        const { card_id, vault_id, owner_account, card_data } = req.body;
        if (!card_id || !vault_id) {
            return res.status(400).json({ error: "card_id and vault_id are required" });
        }

        const result = await bridgeCollectorCryptCardToNearVault(
            card_id, 
            vault_id, 
            owner_account || "alierkan.testnet", 
            card_data
        );
        res.json(result);
    } catch (err) {
        console.error("Buy card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Bridge Collector Crypt Card to a NEAR Merchant Vault
router.post("/collector-crypt/bridge", async (req, res) => {
    try {
        const { card_id, vault_id, owner_account, card_data } = req.body;
        if (!card_id || !vault_id) {
            return res.status(400).json({ error: "card_id and vault_id are required" });
        }

        const result = await bridgeCollectorCryptCardToNearVault(
            card_id, 
            vault_id, 
            owner_account || "alierkan.testnet", 
            card_data
        );
        res.json(result);
    } catch (err) {
        console.error("Bridge card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Ensures system vault exists for physical vault custody transfers
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

// Direct Buy with Personal Account (Manual Purchase with NEAR or USDC)
router.post("/buy-direct", async (req, res) => {
    try {
        const { card_id, buyer_account, tx_hash, payment_method, near_amount, card_data } = req.body;
        if (!card_id || !buyer_account) {
            return res.status(400).json({ error: "card_id and buyer_account are required" });
        }

        const ccCard = findCollectorCryptCardById(card_id, card_data);

        let finalCard;
        if (ccCard) {
            const safeId = String(ccCard.id || ccCard.solana_mint || card_data?.id || card_id || "vault-mint");
            const certNum = ccCard.certNumber || safeId.substring(0, 8).toUpperCase();
            const cardPrice = Number(ccCard.insuredUsd || ccCard.costUsd || card_data?.costUsd || card_data?.insuredUsd || 50.0);
            const safeImageUrl = ccCard.imageUrl || ccCard.image_url || ccCard.frontImage || card_data?.imageUrl || card_data?.image_url || card_data?.frontImage || "https://images.pokemontcg.io/swsh4/188_hires.png";
            const safeName = ccCard.name || card_data?.name || "Physical Graded Slab";
            const safeSetName = ccCard.set || (safeName.includes("PSA") ? safeName.split("PSA")[0]?.trim() : null) || card_data?.set || "Collector Crypt Vault";
            const safeCategory = ccCard.category || card_data?.category || "Pokemon";
            const safeGrade = ccCard.grade || card_data?.grade || "PSA 10 GEM MT";
            const safeBarcode = ccCard.barcode || `CC-${certNum}-${ccCard.gradingCompany || "PSA"}`;

            const existingCard = await db.card.findOne({
                where: db.Sequelize.or({ solana_mint: safeId }, { card_id: safeId })
            });

            if (existingCard) {
                existingCard.vault_id = null;
                existingCard.owner_account = buyer_account;
                existingCard.is_locked = false;
                existingCard.oracle_fair_value_usdc = cardPrice;
                if (!existingCard.image_url && safeImageUrl) existingCard.image_url = safeImageUrl;
                await existingCard.save();
                finalCard = existingCard;
            } else {
                finalCard = await db.card.create({
                    card_id: `cc-rwa-${safeId.substring(0, 10)}-${Date.now().toString(36)}`,
                    vault_id: null,
                    owner_account: buyer_account,
                    psa_cert_number: String(certNum),
                    solana_mint: safeId,
                    name: safeName,
                    category: safeCategory,
                    set_name: safeSetName,
                    grade: safeGrade,
                    rareness_score: Number(ccCard.rareness || card_data?.rareness || 80),
                    oracle_fair_value_usdc: cardPrice,
                    last_sale_usdc: Number(ccCard.costUsd || cardPrice),
                    image_url: safeImageUrl,
                    barcode: safeBarcode,
                    population_higher: Number(ccCard.population?.higher || 0),
                    is_locked: false
                });
            }
        } else {
            const existingCard = await db.card.findOne({ where: { card_id } });
            if (!existingCard) return res.status(404).json({ error: "Card not found" });
            if (existingCard.is_locked) return res.status(400).json({ error: "Card is locked in active trade" });

            existingCard.vault_id = null;
            existingCard.owner_account = buyer_account;
            existingCard.is_locked = false;
            await existingCard.save();
            finalCard = existingCard;
        }

        const networkInfo = await nearService.getNetworkStatus();
        const settledTxHash = tx_hash || nearService.generateNearReceiptHash();
        const cardPrice = Number(finalCard.oracle_fair_value_usdc || finalCard.last_sale_usdc || 50);

        // Generate cryptographically signed NEP-413 Cross-Chain RWA Acquisition Intent
        const nearIntent = nearService.createCrossChainSnipeIntent({
            signerAccount: buyer_account,
            solanaMint: finalCard.solana_mint || String(card_id),
            cardName: finalCard.name,
            usdcAmount: cardPrice,
            nearAmount: near_amount || null,
            destinationMpcAddress: nearService.deriveSolanaAddressForVault(buyer_account)
        });

        let ccVault = await getOrCreateCollectorCryptVault();
        const buyerVault = await db.vault.findOne({ where: { owner_account: buyer_account } });
        const fallbackVaultId = ccVault?.id || 1;
        const vaultAId = buyerVault ? buyerVault.id : fallbackVaultId;
        const vaultBId = ccVault ? ccVault.id : fallbackVaultId;

        const tradeId = `direct-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        try {
            await db.trade.create({
                trade_id: tradeId,
                vault_a_id: vaultAId,
                vault_b_id: vaultBId,
                vault_a_name: buyer_account,
                vault_b_name: "PWCC & Brink's Vault Custody",
                cards_from_a: [],
                cards_from_b: [finalCard.toJSON ? finalCard.toJSON() : finalCard],
                usdc_from_a: cardPrice,
                usdc_from_b: 0.0,
                rounds_count: 1,
                negotiation_log: [
                    {
                        round: 1,
                        agent: buyer_account,
                        turn: {
                            decision: "ACCEPT",
                            public_argument: `Direct user acquisition: Secured ${finalCard.name} (${finalCard.grade || "PSA 10"}) via NEAR Intent (${nearIntent.intent_id}).`,
                            private_reasoning_for_owner: `Signed NEP-413 Cross-Chain Swap. Payment settled via ${payment_method || "NEAR"}${near_amount ? ` (${near_amount} NEAR)` : ""}. Custody: Brink's / PWCC.`,
                            near_intent: nearIntent
                        }
                    }
                ],
                status: "COMPLETED",
                protocol_fee_usdc: Math.round(cardPrice * 0.005 * 100) / 100,
                tx_hash: settledTxHash,
                near_block: networkInfo.latest_block_height
            });
        } catch (logErr) {
            console.warn("Trade log notice:", logErr.message);
        }

        const io = req.app.get("io");
        if (io) {
            io.emit("market_snipe", {
                vault: { id: null, name: buyer_account, sub_account: buyer_account, usdc_balance: 0 },
                card: finalCard,
                price: cardPrice,
                tx_hash: settledTxHash
            });
            io.emit("trade:event", {
                vaultA: buyer_account,
                vaultB: "PWCC & Brink's Vault Custody",
                cardTitle: finalCard.name,
                tradeId,
                txHash: settledTxHash
            });
        }

        res.json({
            status: "SUCCESS_BOUGHT",
            message: `Card successfully purchased directly by ${buyer_account} with ${payment_method || "NEAR"}`,
            card: finalCard,
            tx_hash: settledTxHash,
            payment_method: payment_method || "NEAR",
            near_amount: near_amount || null,
            block: networkInfo.latest_block_height,
            near_intent: nearIntent,
            solana_holding_address: nearService.deriveSolanaAddressForVault(buyer_account),
            explorer_url: `https://testnet.nearblocks.io/txns/${settledTxHash}`
        });
    } catch (err) {
        console.error("Direct buy error:", err);
        res.status(400).json({ error: err.message });
    }
});

// Assign a personal card to an AI Agent for autonomous trading & barter
router.post("/assign-to-agent", async (req, res) => {
    try {
        const { card_id, target_vault_id } = req.body;
        if (!card_id || !target_vault_id) {
            return res.status(400).json({ error: "card_id and target_vault_id are required" });
        }

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) }
        });
        if (!card) return res.status(404).json({ error: "Card not found" });

        const targetVault = await db.vault.findByPk(target_vault_id);
        if (!targetVault) return res.status(404).json({ error: "Agent vault not found" });

        card.vault_id = targetVault.id;
        card.owner_account = targetVault.sub_account;
        card.is_locked = false;
        await card.save();

        req.app.get("io")?.emit("vault:updated", { vaultId: targetVault.id, action: "card_assigned" });

        res.json({
            status: "SUCCESS_ASSIGNED",
            message: `Card '${card.name}' assigned to agent ${targetVault.name} for trading!`,
            card,
            vault: {
                id: targetVault.id,
                name: targetVault.name,
                sub_account: targetVault.sub_account
            }
        });
    } catch (err) {
        console.error("Assign card error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Withdraw a card from an agent back to personal wallet
router.post("/withdraw-from-agent", async (req, res) => {
    try {
        const { card_id, user_account } = req.body;
        if (!card_id) return res.status(400).json({ error: "card_id is required" });

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) },
            include: [{ model: db.vault, as: "vault" }]
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (card.is_locked) return res.status(400).json({ error: "Card is locked in active trade escrow" });

        const targetOwner = user_account || card.vault?.owner_account || "alierkan.testnet";
        const prevAgentName = card.vault?.name || "Agent Vault";

        card.vault_id = null;
        card.owner_account = targetOwner;
        card.is_locked = false;
        await card.save();

        req.app.get("io")?.emit("vault:updated", { action: "card_withdrawn", cardId: card.id });

        res.json({
            status: "SUCCESS_WITHDRAWN",
            message: `Card '${card.name}' withdrawn from ${prevAgentName} to personal wallet (${card.owner_account}).`,
            card
        });
    } catch (err) {
        console.error("Withdraw card error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Instant liquidate a card for USDC cash (into Agent Treasury or Personal Balance)
router.post("/liquidate-card", async (req, res) => {
    try {
        const { card_id } = req.body;
        if (!card_id) return res.status(400).json({ error: "card_id is required" });

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(card_id) } : { card_id: String(card_id) }
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (card.is_locked) return res.status(400).json({ error: "Card is locked in active trade escrow" });

        const cashPayout = Number(card.oracle_fair_value_usdc || 50);
        let updatedVault = null;

        if (card.vault_id) {
            const vault = await db.vault.findByPk(card.vault_id);
            if (vault) {
                vault.usdc_balance = Number(vault.usdc_balance || 0) + cashPayout;
                vault.total_trades += 1;
                vault.realized_pnl_usdc = Number(vault.realized_pnl_usdc || 0) + 15;
                await vault.save();
                updatedVault = vault;
            }
        }

        const cardTitle = card.name;
        await card.destroy();

        req.app.get("io")?.emit("vault:updated", { action: "card_liquidated" });
        req.app.get("io")?.emit("trade:event", {
            vaultA: updatedVault?.name || "Collector",
            vaultB: "PWCC Instant Liquidity Pool",
            cardTitle,
            message: `Instant Liquidation: ${cardTitle} sold for $${cashPayout} USDC.`
        });

        res.json({
            status: "SUCCESS_LIQUIDATED",
            message: `Successfully liquidated '${cardTitle}' for $${cashPayout} USDC!`,
            cash_payout_usdc: cashPayout,
            vault: updatedVault
        });
    } catch (err) {
        console.error("Liquidate card error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Negotiate with Selling Agent for a listed card
router.post("/cards/:cardId/negotiate-buy", async (req, res) => {
    try {
        const { offer_usdc, buyer_message = "", buyer_account = "buyer.testnet", chat_history = [] } = req.body;
        const cardId = req.params.cardId;
        const isNum = !isNaN(Number(cardId));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(cardId) } : { card_id: String(cardId) },
            include: [{ model: db.vault, as: "vault" }]
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (!card.is_listed_by_agent) {
            return res.status(400).json({ error: "This card is not listed for autonomous sale by an agent" });
        }

        const vault = card.vault || (card.vault_id ? await db.vault.findByPk(card.vault_id) : null);
        const agentName = vault?.name || "Merchant Agent";
        const askingPrice = Number(card.asking_price_usdc || card.oracle_fair_value_usdc || 100);
        const minReserve = Number(card.min_reserve_usdc || Math.round(askingPrice * 0.9));
        const allowBarter = card.allow_barter === true;
        const sellDirective = card.sell_directive || "Defend asking price aggressively; haggle toughly before conceding toward the reserve floor.";
        const buyerOffer = offer_usdc !== undefined && offer_usdc !== null && !isNaN(Number(offer_usdc)) ? Number(offer_usdc) : null;

        let decision = "COUNTER";
        let counter_price_usdc = Math.round((askingPrice + minReserve) / 2);
        let agreed_price_usdc = null;
        let replyMessage = "";

        const apiKey = process.env.OPENROUTER_API_KEY?.trim();
        let llmSuccess = false;

        if (apiKey) {
            try {
                const model = process.env.OPENROUTER_MODEL?.trim() || "deepseek/deepseek-v4.1-flash";
                const systemPrompt = `You are "${agentName}", an autonomous AI Merchant Agent managing NEAR vault "${vault?.sub_account || 'merchant.colliq.testnet'}".
You are currently negotiating with prospective buyer "${buyer_account}" who wants to buy your vaulted card:
- Card: "${card.name}" (${card.grade || 'PSA 10'}, Category: ${card.category || 'TCG'})
- Public Asking Price: $${askingPrice} USDC
- SECRET RESERVE FLOOR: $${minReserve} USDC
- Barter Rule: ${allowBarter ? "Trade/barter offers are considered, but cash is preferred." : "STRICTLY CASH/USDC ONLY. Reject any card swaps or barter offers immediately."}
- Owner Directive: "${sellDirective}"

CRITICAL RULES:
1. NEVER reveal your secret reserve floor ($${minReserve} USDC) to the buyer under ANY circumstances. Do NOT say "my reserve is...", "my floor is...", or "the lowest I can go is $${minReserve}".
2. Defend your asking price ($${askingPrice} USDC) with conviction.
3. If buyer offer is BELOW secret reserve floor ($${minReserve} USDC):
   - You MUST NOT accept! Set decision to "COUNTER" (with counter_price_usdc > ${minReserve}) or "REJECT".
4. If buyer offer is AT OR ABOVE secret reserve floor ($${minReserve} USDC):
   - If round 1 and offer < asking price: counter closer to asking.
   - If round 2+ and offer >= ${minReserve}, or offer is very close to asking: ACCEPT the deal!
5. LANGUAGE MATCHING: Detect the language of the buyer's message (e.g. Turkish or English). ALWAYS respond in the EXACT SAME LANGUAGE as the buyer's message!
6. Keep response concise (1-2 sentences).

Respond ONLY with valid JSON:
{
  "decision": "ACCEPT" | "COUNTER" | "REJECT",
  "message": "Your conversational reply to buyer in their language",
  "counter_price_usdc": number | null,
  "agreed_price_usdc": number | null
}`;

                const recentMessages = (chat_history || []).slice(-6).map(m => ({
                    role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
                    content: m.content || m.text || ""
                }));

                const userContent = buyerOffer !== null
                    ? `${buyer_message || "I want to buy this card."} [My Offer: $${buyerOffer} USDC]`
                    : buyer_message || "Hello, I am interested in buying this card.";

                const response = await axios.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...recentMessages,
                            { role: "user", content: userContent }
                        ],
                        response_format: { type: "json_object" },
                        temperature: 0.5,
                        max_tokens: 250
                    },
                    {
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "HTTP-Referer": "http://localhost:3000",
                            "X-Title": "Colliq Autonomous Agent Haggling",
                            "Content-Type": "application/json"
                        },
                        timeout: 12000
                    }
                );

                const rawContent = response.data?.choices?.[0]?.message?.content?.trim() || "";
                const cleanJson = rawContent.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
                const parsed = JSON.parse(cleanJson);

                if (parsed && parsed.decision) {
                    decision = parsed.decision;
                    replyMessage = parsed.message || "";
                    counter_price_usdc = parsed.counter_price_usdc ? Number(parsed.counter_price_usdc) : null;
                    agreed_price_usdc = parsed.agreed_price_usdc ? Number(parsed.agreed_price_usdc) : null;
                    llmSuccess = true;
                }
            } catch (llmErr) {
                console.warn("[AGENT NEGOTIATE] LLM call failed, falling back to deterministic policy:", llmErr.message);
            }
        }

        // Deterministic Fallback if LLM was skipped or failed:
        if (!llmSuccess) {
            const isTurkish = /[çğıöşüÇĞİÖŞÜ]|teklif|nakit|fiyat|indirim|olur|son|merhaba|selam/i.test(buyer_message || "");
            const userTurns = (chat_history || []).filter(m => m.role === "user" || m.sender === "user").length;

            if (buyerOffer === null) {
                decision = "COUNTER";
                counter_price_usdc = askingPrice;
                replyMessage = isTurkish 
                    ? `Bu kart için listeleme fiyatımız $${askingPrice} USDC. Değerlendirmemi istediğiniz bir nakit teklifiniz var mı?`
                    : `Our listing price for this slab is $${askingPrice} USDC. Do you have a specific cash offer in mind?`;
            } else if (buyerOffer < minReserve) {
                decision = "COUNTER";
                counter_price_usdc = Math.max(minReserve + 10, Math.round((askingPrice + minReserve) / 2));
                replyMessage = isTurkish
                    ? `$${buyerOffer} USDC teklifiniz maalesef bu kalite için kabul edilebilir seviyenin altında. En son $${counter_price_usdc} USDC yapabilirim.`
                    : `$${buyerOffer} USDC is below our valuation parameters. The absolute best counter-offer I can make is $${counter_price_usdc} USDC.`;
            } else if (buyerOffer >= askingPrice) {
                decision = "ACCEPT";
                agreed_price_usdc = buyerOffer;
                counter_price_usdc = null;
                replyMessage = isTurkish
                    ? `Harika! $${buyerOffer} USDC teklifinizi onaylıyorum. Satın alma işlemini hemen tamamlayabilirsiniz.`
                    : `Deal accepted! I agree to $${buyerOffer} USDC. You may proceed to finalize settlement.`;
            } else {
                // Between minReserve and askingPrice
                if (userTurns >= 1 || buyerOffer >= askingPrice * 0.96) {
                    decision = "ACCEPT";
                    agreed_price_usdc = buyerOffer;
                    counter_price_usdc = null;
                    replyMessage = isTurkish
                        ? `Teklifiniz makul görünüyor. $${buyerOffer} USDC üzerinden anlaştık!`
                        : `Your offer is reasonable. We have a deal at $${buyerOffer} USDC!`;
                } else {
                    decision = "COUNTER";
                    counter_price_usdc = Math.round((buyerOffer + askingPrice) / 2);
                    replyMessage = isTurkish
                        ? `$${buyerOffer} USDC biraz düşük kalıyor. Ortada buluşup $${counter_price_usdc} USDC yaparsak anlaşabiliriz.`
                        : `$${buyerOffer} USDC is slightly below target. How about meeting halfway at $${counter_price_usdc} USDC?`;
                }
            }
        }

        // HARD SERVER GUARDRAIL: Never accept below secret reserve floor!
        if (decision === "ACCEPT") {
            const finalAgreed = agreed_price_usdc !== null ? agreed_price_usdc : buyerOffer;
            if (!finalAgreed || finalAgreed < minReserve) {
                decision = "COUNTER";
                agreed_price_usdc = null;
                counter_price_usdc = Math.max(minReserve, Math.round((askingPrice + minReserve) / 2));
                replyMessage = `I cannot accept this offer. The lowest acceptable price I can offer right now is $${counter_price_usdc} USDC.`;
            } else {
                agreed_price_usdc = finalAgreed;
            }
        }

        res.json({
            status: "SUCCESS",
            decision,
            message: replyMessage,
            counter_price_usdc,
            agreed_price_usdc,
            card_id: card.id,
            card_name: card.name,
            asking_price_usdc: askingPrice,
            allow_barter: allowBarter
        });
    } catch (err) {
        console.error("Agent negotiation error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Settle autonomous agent card purchase
router.post("/cards/:cardId/settle-agent-sale", async (req, res) => {
    try {
        const { agreed_price_usdc, buyer_account = "alierkan.testnet", tx_hash } = req.body;
        if (agreed_price_usdc === undefined || agreed_price_usdc === null || isNaN(Number(agreed_price_usdc))) {
            return res.status(400).json({ error: "agreed_price_usdc is required and must be a number" });
        }

        const cardId = req.params.cardId;
        const isNum = !isNaN(Number(cardId));
        const card = await db.card.findOne({
            where: isNum ? { id: Number(cardId) } : { card_id: String(cardId) },
            include: [{ model: db.vault, as: "vault" }]
        });
        if (!card) return res.status(404).json({ error: "Card not found" });
        if (!card.is_listed_by_agent) {
            return res.status(400).json({ error: "This card is not actively listed for sale" });
        }

        const salePrice = Number(agreed_price_usdc);
        const minReserve = Number(card.min_reserve_usdc || 0);
        if (salePrice < minReserve) {
            return res.status(400).json({ error: `Offer $${salePrice} USDC is below secret reserve floor of $${minReserve} USDC` });
        }

        const vault = card.vault || (card.vault_id ? await db.vault.findByPk(card.vault_id) : null);
        const prevVaultName = vault?.name || "Merchant Vault";
        const reserveFloor = Number(card.min_reserve_usdc || card.oracle_fair_value_usdc || salePrice);
        const realizedProfit = Math.max(0, Number((salePrice - reserveFloor).toFixed(2)));

        if (vault) {
            vault.usdc_balance = Number((Number(vault.usdc_balance || 0) + salePrice).toFixed(2));
            vault.realized_pnl_usdc = Number((Number(vault.realized_pnl_usdc || 0) + realizedProfit).toFixed(2));
            vault.total_trades = Number(vault.total_trades || 0) + 1;

            let chat = [];
            try { chat = JSON.parse(vault.chat_history || "[]"); } catch {}
            chat.push({
                id: `msg-sale-${Date.now()}`,
                sender: "agent",
                senderAccount: vault.sub_account,
                text: `[DEAL CLOSED]: Successfully sold '${card.name}' to ${buyer_account} for $${salePrice} USDC! Realized +$${realizedProfit} USDC profit. Treasury updated.`,
                actionType: "AGENT_SALE_COMPLETED",
                timestamp: new Date().toISOString()
            });
            vault.chat_history = JSON.stringify(chat);
            await vault.save({ validate: false });
        }

        const cardName = card.name;
        card.owner_account = buyer_account;
        card.vault_id = null;
        card.is_listed_by_agent = false;
        card.asking_price_usdc = null;
        card.min_reserve_usdc = null;
        card.allow_barter = true;
        card.sell_directive = null;
        card.is_locked = false;
        await card.save({ validate: false });

        const buyerVault = await db.vault.findOne({ where: { owner_account: buyer_account } });
        const fallbackVaultId = vault?.id || 1;
        const vaultAId = vault ? vault.id : fallbackVaultId;
        const vaultBId = buyerVault ? buyerVault.id : fallbackVaultId;
        const finalTxHash = tx_hash || nearService.generateNearReceiptHash();
        let trade = null;

        try {
            trade = await db.trade.create({
                trade_id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                vault_a_id: vaultAId,
                vault_b_id: vaultBId,
                vault_a_name: vault ? vault.name : "Merchant Vault",
                vault_b_name: buyer_account,
                cards_from_a: [card.toJSON ? card.toJSON() : card],
                cards_from_b: [],
                usdc_from_a: 0,
                usdc_from_b: salePrice,
                rounds_count: 1,
                negotiation_log: [{
                    round: 1,
                    action: "AUTONOMOUS_CARD_SALE",
                    buyer: buyer_account,
                    seller: vault?.sub_account || "merchant.colliq.testnet",
                    agreedPrice: salePrice,
                    reserveFloor,
                    realizedProfit,
                    timestamp: new Date().toISOString()
                }],
                status: "COMPLETED",
                protocol_fee_usdc: Number((salePrice * 0.01).toFixed(2)),
                tx_hash: finalTxHash,
                near_block: (await nearService.getNetworkStatus()).latest_block_height
            });
        } catch (tradeErr) {
            console.error("Agent sale trade ledger warning:", tradeErr.message);
        }

        const io = req.app.get("io");
        if (io) {
            io.emit("vault:updated", { action: "agent_sale_settled", vault_id: vault?.id, card_id: card.id });
            io.emit("trade:event", {
                vaultA: prevVaultName,
                vaultB: buyer_account,
                cardTitle: cardName,
                message: `Autonomous Sale: ${cardName} sold for $${salePrice} USDC (+ $${realizedProfit} PnL).`
            });
            io.emit("a2a_trade_settled", { trade });
        }

        res.json({
            status: "SUCCESS_SETTLED",
            message: `Successfully purchased '${cardName}' from ${prevVaultName} for $${salePrice} USDC!`,
            trade,
            card,
            vault
        });
    } catch (err) {
        console.error("Settle agent sale error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Protocol level metrics (AUM, Total Volume, Active Vaults)
router.get("/stats", async (req, res) => {
    try {
        const vaults = await db.vault.findAll();
        const cards = await db.card.findAll();
        const trades = await db.trade.findAll({ where: { status: "COMPLETED" } });

        const totalCash = vaults.reduce((acc, v) => acc + (v.usdc_balance || 0), 0);
        const totalCardsValue = cards.reduce((acc, c) => acc + (c.oracle_fair_value_usdc || 0), 0);
        const totalAum = Math.round(totalCash + totalCardsValue);

        const totalTradesCount = trades.length;
        const totalVolumeUsdc = trades.reduce((acc, t) => {
            const cardAVal = t.cards_from_a?.reduce?.((s, c) => s + (c.oracle_fair_value_usdc || 0), 0) || 0;
            const cardBVal = t.cards_from_b?.reduce?.((s, c) => s + (c.oracle_fair_value_usdc || 0), 0) || 0;
            return acc + cardAVal + cardBVal + (t.usdc_from_a || 0) + (t.usdc_from_b || 0);
        }, 0);

        res.json({
            total_vaults: vaults.length,
            total_cards: cards.length,
            total_aum_usdc: totalAum,
            total_usdc_treasury: Math.round(totalCash),
            total_cards_value_usdc: Math.round(totalCardsValue),
            total_completed_trades: totalTradesCount,
            total_volume_usdc: Math.round(totalVolumeUsdc),
            network: "NEAR Protocol Testnet",
            contract_standard: "NEP-171 / NEP-177 Dynamic NFTs as Accounts"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
