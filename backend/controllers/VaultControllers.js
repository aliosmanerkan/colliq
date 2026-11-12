import express from "express";
import db from "../model/model.js";
import { generateVaultDynamicSvg } from "../services/DynamicSvgService.js";
import nearService from "../services/NearService.js";
import agentChatService from "../services/AgentChatService.js";
import agentInceptionService from "../services/AgentInceptionService.js";
import a2aSwarm from "../services/A2ASwarmService.js";

export function getVaultWhere(idParam) {
    const isNum = !isNaN(idParam) && !isNaN(parseInt(idParam)) && !String(idParam).includes("-");
    if (isNum) {
        return { [db.Sequelize.Op.or]: [{ id: Number(idParam) }, { vault_id: String(idParam) }] };
    }
    return { [db.Sequelize.Op.or]: [{ vault_id: String(idParam) }, { sub_account: String(idParam) }] };
}

const router = express.Router();

// GET all vaults
router.get("/", async (req, res) => {
    try {
        const vaults = await db.vault.findAll({
            where: {
                sub_account: { [db.Sequelize.Op.ne]: "collectorcrypt.colliq.testnet" }
            },
            include: [{ model: db.card, as: "inventory" }],
            order: [["total_trades", "DESC"]]
        });

        const formatted = vaults.map(v => {
            const inventory = v.inventory || [];
            const inventoryValue = inventory.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0);
            const totalAumUsdc = v.usdc_balance + inventoryValue;

            return {
                ...v.toJSON(),
                inventoryCount: inventory.length,
                inventoryValueUsdc: Math.round(inventoryValue),
                totalAumUsdc: Math.round(totalAumUsdc)
            };
        });

        res.json({ vaults: formatted });
    } catch (err) {
        console.error("Vaults error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET single vault by ID
router.get("/:id", async (req, res) => {
    try {
        const vault = await db.vault.findOne({
            where: getVaultWhere(req.params.id),
            include: [{ model: db.card, as: "inventory" }]
        });

        if (!vault) return res.status(404).json({ error: "Vault not found" });

        const inventory = vault.inventory || [];
        const inventoryValue = inventory.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0);
        const svg = generateVaultDynamicSvg(vault, inventory.length, inventoryValue);

        res.json({
            vault: {
                ...vault.toJSON(),
                inventoryCount: inventory.length,
                inventoryValueUsdc: Math.round(inventoryValue),
                totalAumUsdc: Math.round(vault.usdc_balance + inventoryValue),
                dynamic_svg: svg
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Dynamic SVG endpoint for on-chain rendering / <img> tag
router.get("/:id/svg", async (req, res) => {
    try {
        const vault = await db.vault.findOne({
            where: getVaultWhere(req.params.id),
            include: [{ model: db.card, as: "inventory" }]
        });

        if (!vault) return res.status(404).send("<svg><text>Vault not found</text></svg>");

        const inventory = vault.inventory || [];
        const inventoryValue = inventory.reduce((sum, c) => sum + (c.oracle_fair_value_usdc || 0), 0);
        const svg = generateVaultDynamicSvg(vault, inventory.length, inventoryValue);

        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "no-cache");
        res.send(svg);
    } catch (err) {
        res.status(500).send(`<svg><text>${err.message}</text></svg>`);
    }
});

// AGENT GENESIS & INCEPTION CHAT (Interactive Co-Pilot)
router.post("/inception-chat", async (req, res) => {
    try {
        const { messages, currentBlueprint, user_account } = req.body;
        const result = await agentInceptionService.processInceptionTurn({
            messages: messages || [],
            currentBlueprint: currentBlueprint || {},
            userAccount: user_account || "alierkan.testnet"
        });
        res.json(result);
    } catch (err) {
        console.error("Inception chat error:", err);
        res.status(500).json({ error: err.message });
    }
});

// MINT new Merchant Vault NFT
router.post("/mint", async (req, res) => {
    try {
        const { 
            name, 
            owner_account, 
            usdc_deposit, 
            strategy, 
            guardrail_max_spend, 
            guardrail_min_oracle_fair_value_pct,
            custom_rules,
            system_prompt,
            bio,
            custom_suffix
        } = req.body;

        if (!name || !owner_account) {
            return res.status(400).json({ error: "Name and owner_account are required" });
        }

        const count = await db.vault.count();
        const nextId = count + 1;

        // Generate unique sub-account: <name-slug>-<unique-hash>.colliq.testnet
        let subAccount = nearService.generateSubAccount(name, custom_suffix);
        let exists = await db.vault.findOne({ where: { sub_account: subAccount } });
        while (exists) {
            subAccount = nearService.generateSubAccount(name);
            exists = await db.vault.findOne({ where: { sub_account: subAccount } });
        }

        const keyPair = nearService.generateAgentFunctionCallKey(subAccount);

        const rulesArray = Array.isArray(custom_rules) ? custom_rules : [];
        const rulesJson = Array.isArray(custom_rules) ? JSON.stringify(custom_rules) : (typeof custom_rules === "string" ? custom_rules : "[]");

        const vaultUid = `v-${subAccount.split('.')[0]}`;

        // Format an initial welcome message reflecting the specific custom rules
        const initialWelcomeMsg = {
            id: `msg-welcome-${Date.now()}`,
            sender: "agent",
            senderAccount: subAccount,
            text: `Welcome! I am ${name} (@${subAccount}), your autonomous NEAR Merchant Vault trading agent.\n\nInitialized with a $${Number(usdc_deposit) || 500} USDC treasury and calibrated for ${strategy || "BALANCED_TRADER"}.${rulesArray.length > 0 ? `\n\nActive Inception Directives:\n${rulesArray.map(r => `• ${r}`).join("\n")}` : ""}\n\nI am connected to 1,000+ Brink's Vaulted PSA slabs and the A2A barter exchange. How would you like me to begin?`,
            actionType: "GREETING",
            timestamp: new Date().toISOString()
        };

        const newVault = await db.vault.create({
            vault_id: vaultUid,
            sub_account: subAccount,
            name,
            owner_account,
            usdc_balance: Number(usdc_deposit) || 500.0,
            strategy: strategy || "BALANCED_TRADER",
            tier: "ROOKIE",
            guardrail_max_spend_per_trade: Number(guardrail_max_spend) || 300.0,
            guardrail_min_oracle_fair_value_pct: Number(guardrail_min_oracle_fair_value_pct) || 80.0,
            custom_rules: rulesJson,
            system_prompt: system_prompt || `You are the autonomous AI trading agent managing this NEAR Merchant Vault (${subAccount}). Follow your owner's custom directives strictly.`,
            chat_history: JSON.stringify([initialWelcomeMsg]),
            access_key_public: keyPair.publicKey,
            bio: bio || "Newly minted Autonomous Merchant Vault."
        });

        // Autonomous Inception Scan & Inaugural Market Snipe
        let inauguralSnipe = null;
        try {
            inauguralSnipe = await a2aSwarm.scanAndSnipeForNewVault(newVault);
            await newVault.reload();
        } catch (snipeErr) {
            console.warn("Inaugural market scan notice:", snipeErr.message);
        }

        res.status(201).json({
            status: "MINTED",
            vault: newVault,
            accessKey: keyPair,
            inauguralSnipe
        });
    } catch (err) {
        console.error("Mint error:", err);
        res.status(500).json({ error: err.message });
    }
});

// TRANSFER "Business-in-a-Box" (Executes Zombie Key Wipe)
router.post("/:id/transfer", async (req, res) => {
    try {
        const { new_owner } = req.body;
        if (!new_owner) {
            return res.status(400).json({ error: "new_owner is required" });
        }

        const result = await nearService.executeZombieKeyWipe(req.params.id, new_owner);
        res.json({
            message: "Business-in-a-Box NFT successfully transferred. Zombie key wiped & fresh key generated.",
            result
        });
    } catch (err) {
        console.error("Transfer error:", err);
        res.status(400).json({ error: err.message });
    }
});

// LIST VAULT FOR SALE (Anti-Front-Running Lock)
router.post("/:id/list-for-sale", async (req, res) => {
    try {
        const { sale_price_usdc, owner_account } = req.body;
        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        if (owner_account && vault.owner_account !== owner_account) {
            return res.status(403).json({ error: "Only the vault owner can list this vault for sale" });
        }

        const price = Number(sale_price_usdc);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ error: "Valid sale_price_usdc is required" });
        }

        // Check active trade / negotiation in db.trade
        const activeTrade = await db.trade.findOne({
            where: {
                [db.Sequelize.Op.or]: [
                    { vault_a_id: vault.id },
                    { vault_b_id: vault.id }
                ],
                status: "PENDING"
            }
        });

        if (activeTrade) {
            return res.status(400).json({ error: "Vault is currently engaged in active trade negotiation. Cannot list for sale." });
        }

        if (vault.is_locked && vault.lock_reason !== "LISTED_FOR_SALE") {
            return res.status(400).json({ error: `Vault is currently locked (${vault.lock_reason || "ACTIVE_TRADE"}). Cannot list for sale.` });
        }

        // Set listing state with Anti-Front-Running lock
        vault.is_listed_for_sale = true;
        vault.sale_price_usdc = price;
        vault.is_locked = true;
        vault.lock_reason = "LISTED_FOR_SALE";

        // Log into chat history
        let chat = [];
        try { chat = JSON.parse(vault.chat_history || "[]"); } catch (e) { chat = []; }
        chat.push({
            role: "assistant",
            content: `Vault listed on Colliq Marketplace for $${price.toLocaleString()} USDC. Anti-front-running lock engaged. All assets and cards secured until sale or unlisting.`,
            timestamp: new Date().toISOString()
        });
        vault.chat_history = JSON.stringify(chat);

        await vault.save();

        const io = req.app.get("io");
        if (io) {
            io.emit("vault:updated", {
                vaultId: vault.id,
                sub_account: vault.sub_account,
                is_listed_for_sale: true,
                sale_price_usdc: vault.sale_price_usdc,
                is_locked: true,
                lock_reason: "LISTED_FOR_SALE"
            });
        }

        res.json({
            success: true,
            message: "Vault successfully listed on marketplace with anti-front-running lock.",
            vault
        });
    } catch (err) {
        console.error("List for sale error:", err);
        res.status(500).json({ error: err.message });
    }
});

// UNLIST VAULT FROM SALE (Release Lock)
router.post("/:id/unlist-sale", async (req, res) => {
    try {
        const { owner_account } = req.body;
        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        if (owner_account && vault.owner_account !== owner_account) {
            return res.status(403).json({ error: "Only the vault owner can unlist this vault" });
        }

        vault.is_listed_for_sale = false;
        vault.sale_price_usdc = null;
        vault.is_locked = false;
        vault.lock_reason = null;

        let chat = [];
        try { chat = JSON.parse(vault.chat_history || "[]"); } catch (e) { chat = []; }
        chat.push({
            role: "assistant",
            content: "Vault unlisted from marketplace. Lock released. Vault is active for autonomous trading.",
            timestamp: new Date().toISOString()
        });
        vault.chat_history = JSON.stringify(chat);

        await vault.save();

        const io = req.app.get("io");
        if (io) {
            io.emit("vault:updated", {
                vaultId: vault.id,
                sub_account: vault.sub_account,
                is_listed_for_sale: false,
                sale_price_usdc: null,
                is_locked: false,
                lock_reason: null
            });
        }

        res.json({
            success: true,
            message: "Vault unlisted successfully. Lock released.",
            vault
        });
    } catch (err) {
        console.error("Unlist sale error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ACQUIRE VAULT (Instant Zombie Key Wipe + Atomic Ownership Transfer)
router.post("/:id/buy-vault", async (req, res) => {
    try {
        const { buyer_account, payment_method, tx_hash } = req.body;
        if (!buyer_account) {
            return res.status(400).json({ error: "buyer_account is required" });
        }

        const vault = await db.vault.findOne({
            where: getVaultWhere(req.params.id),
            include: [{ model: db.card, as: "inventory" }]
        });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        if (!vault.is_listed_for_sale) {
            return res.status(400).json({ error: "This vault is not currently listed for sale" });
        }

        if (vault.owner_account === buyer_account) {
            return res.status(400).json({ error: "You already own this vault" });
        }

        const salePrice = vault.sale_price_usdc || 0;
        const previousOwner = vault.owner_account;

        // 1. Atomic Zombie Key Wipe
        const wipeResult = await nearService.executeZombieKeyWipe(vault.id, buyer_account, true);

        // 2. Transfer Vault Ownership & Reset Listing/Lock State
        vault.owner_account = buyer_account;
        vault.is_listed_for_sale = false;
        vault.sale_price_usdc = null;
        vault.is_locked = false;
        vault.lock_reason = null;

        // 3. Record Business Acquisition into db.trade
        const tradeRecord = await db.trade.create({
            trade_id: `acq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            vault_a_id: vault.id,
            vault_b_id: vault.id,
            vault_a_name: vault.name,
            vault_b_name: buyer_account,
            cards_from_a: vault.inventory || [],
            cards_from_b: [],
            usdc_from_a: 0,
            usdc_from_b: salePrice,
            rounds_count: 1,
            negotiation_log: [{
                round: 1,
                action: "BUSINESS_ACQUISITION",
                buyer: buyer_account,
                seller: previousOwner,
                salePrice,
                timestamp: new Date().toISOString()
            }],
            status: "COMPLETED",
            protocol_fee_usdc: Number((salePrice * 0.01).toFixed(2)),
            tx_hash: tx_hash || wipeResult.txHash || `0xacq${Date.now()}`,
            near_block: wipeResult.nearBlock || 118492031
        });

        // 4. Record into Chat History
        let chat = [];
        try { chat = JSON.parse(vault.chat_history || "[]"); } catch (e) { chat = []; }
        chat.push({
            role: "assistant",
            content: `BUSINESS_ACQUISITION: Ownership transferred from ${previousOwner} to ${buyer_account} for $${salePrice.toLocaleString()} USDC. Old Function-Call access key revoked. Fresh Ed25519 key assigned. Welcome to Colliq Protocol.`,
            timestamp: new Date().toISOString()
        });
        vault.chat_history = JSON.stringify(chat);

        await vault.save();

        const io = req.app.get("io");
        if (io) {
            io.emit("vault:updated", {
                vaultId: vault.id,
                sub_account: vault.sub_account,
                owner_account: buyer_account,
                is_listed_for_sale: false,
                sale_price_usdc: null,
                is_locked: false,
                lock_reason: null
            });

            io.emit("trade:executed", {
                trade_id: tradeRecord.trade_id,
                vault_name: vault.name,
                type: "BUSINESS_ACQUISITION",
                buyer_account,
                salePrice,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            message: "Business-in-a-Box acquired successfully. Zombie key wiped & ownership transferred.",
            vault,
            wipeResult,
            trade: tradeRecord
        });
    } catch (err) {
        console.error("Buy vault error:", err);
        res.status(500).json({ error: err.message });
    }
});

// AGENT SNIPES / BUYS A CARD FROM THE MARKETPLACE
router.post("/:id/snipe", async (req, res) => {
    try {
        const { card_id, card_data } = req.body;
        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        const { bridgeCollectorCryptCardToNearVault } = await import("../services/CollectorCryptService.js");
        const result = await bridgeCollectorCryptCardToNearVault(card_id, vault.id, vault.sub_account, card_data);

        // Record snipe into trade ledger
        const cardPrice = Number(result.card.oracle_fair_value_usdc || 50);
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
                custom_rules: JSON.stringify(["Physical Slab Custodian"]),
                chat_history: "[]",
                access_key_public: "ed25519:collectorcryptsystemkey",
                bio: "Physical vault custodian securing 170k+ authenticated PSA/CGC slabs."
            });
        }

        const tradeId = `snipe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const nearBlock = 276399000 + Math.floor(Math.random() * 5000);
        const txHash = `0xnear_snipe_${Date.now()}`;

        await db.trade.create({
            trade_id: tradeId,
            vault_a_id: vault.id,
            vault_b_id: ccVault.id,
            vault_a_name: vault.name,
            vault_b_name: "Collector Crypt Vault (PWCC / Brink's)",
            cards_from_a: [],
            cards_from_b: [result.card],
            usdc_from_a: cardPrice,
            usdc_from_b: 0.0,
            rounds_count: 1,
            negotiation_log: [
                {
                    round: 1,
                    agent: vault.name,
                    turn: {
                        decision: "ACCEPT",
                        public_argument: `Direct market acquisition: Secured ${result.card.name} (${result.card.grade || "PSA 10"}) at $${cardPrice.toFixed(2)} USDC.`,
                        private_reasoning_for_owner: `Physical slab bridged to vault sub-account. Remaining treasury: $${vault.usdc_balance.toFixed(2)} USDC.`
                    }
                }
            ],
            status: "COMPLETED",
            protocol_fee_usdc: Math.round(cardPrice * 0.005 * 100) / 100,
            tx_hash: txHash,
            near_block: nearBlock
        });

        // Append to chat history
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
            text: `[DIRECT MARKET SNIPE]\nAcquired ${result.card.name} (${result.card.grade || "PSA 10"}) from Collector Crypt for $${cardPrice.toFixed(2)} USDC.\nPhysical custody secured in PWCC/Brink's vault. Remaining treasury: $${vault.usdc_balance.toFixed(2)} USDC.`,
            actionType: "MARKET_SNIPE",
            timestamp: new Date().toISOString()
        });

        vault.chat_history = JSON.stringify(history);
        await vault.save();

        const io = req.app.get("io");
        if (io) {
            io.emit("market_snipe", {
                vault: { id: vault.id, name: vault.name, sub_account: vault.sub_account, usdc_balance: vault.usdc_balance },
                card: result.card,
                price: cardPrice,
                tx_hash: txHash
            });
            io.emit("vault:updated", { vaultId: vault.id, newBalance: vault.usdc_balance });
        }

        res.json({
            status: "SNIPED_BY_AGENT",
            message: `Agent ${vault.name} (${vault.sub_account}) successfully acquired card!`,
            ...result
        });
    } catch (err) {
        console.error("Agent snipe error:", err);
        res.status(400).json({ error: err.message });
    }
});

// WITHDRAW CARD FROM VAULT TO PERSONAL WALLET
router.post("/:id/withdraw-card", async (req, res) => {
    try {
        const { card_id, destination_account } = req.body;
        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });
        if (vault.is_locked) return res.status(400).json({ error: "Vault is locked" });

        const isNum = !isNaN(Number(card_id));
        const card = await db.card.findOne({
            where: isNum
                ? { [db.Sequelize.Op.or]: [{ id: Number(card_id) }, { card_id: String(card_id) }], vault_id: vault.id }
                : { card_id: String(card_id), vault_id: vault.id }
        });
        if (!card) return res.status(404).json({ error: "Card not in this vault" });

        card.vault_id = null;
        card.owner_account = destination_account || vault.owner_account || "alierkan.testnet";
        card.is_locked = false;
        await card.save();

        req.app.get("io")?.emit("vault:updated", { vaultId: vault.id, action: "card_withdrawn", cardId: card.id });

        res.json({
            status: "WITHDRAWN",
            message: `Card withdrawn from ${vault.sub_account} to ${card.owner_account}`,
            card
        });
    } catch (err) {
        console.error("Withdraw card error:", err);
        res.status(400).json({ error: err.message });
    }
});

// TOGGLE CARD HOLD / PROTECTED STATUS
router.post("/cards/:cardId/toggle-hold", async (req, res) => {
    try {
        const cardId = req.params.cardId;
        const isNum = !isNaN(Number(cardId));
        const card = await db.card.findOne({
            where: isNum
                ? { [db.Sequelize.Op.or]: [{ id: Number(cardId) }, { card_id: String(cardId) }] }
                : { card_id: String(cardId) }
        });
        if (!card) return res.status(404).json({ error: "Card not found" });

        card.is_hold = !card.is_hold;
        await card.save();

        req.app.get("io")?.emit("vault:updated", { 
            vaultId: card.vault_id, 
            action: "card_hold_toggled", 
            cardId: card.id, 
            is_hold: card.is_hold 
        });

        res.json({
            status: "SUCCESS",
            is_hold: card.is_hold,
            message: card.is_hold ? "Card marked as Protected Hold slab." : "Card unlocked for A2A barter.",
            card
        });
    } catch (err) {
        console.error("Toggle hold error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DEPOSIT USDC TO AGENT TREASURY
router.post("/:id/deposit-treasury", async (req, res) => {
    try {
        const { amount, tx_hash } = req.body;
        const depositAmt = parseFloat(amount);
        if (isNaN(depositAmt) || depositAmt <= 0) {
            return res.status(400).json({ error: "Deposit amount must be a positive number." });
        }

        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        vault.usdc_balance = Math.round((vault.usdc_balance + depositAmt) * 100) / 100;

        // Append system notification to chat history
        let history = [];
        try {
            history = JSON.parse(vault.chat_history || "[]");
        } catch {}
        history.push({
            id: `msg-fund-${Date.now()}`,
            sender: "system",
            text: `Treasury funded with +$${depositAmt.toLocaleString()} USDC. Active balance: $${vault.usdc_balance.toLocaleString()} USDC.`,
            actionType: "TREASURY_FUND",
            timestamp: new Date().toISOString()
        });
        vault.chat_history = JSON.stringify(history);
        await vault.save();

        req.app.get("io")?.emit("vault:updated", { 
            vaultId: vault.id, 
            action: "treasury_deposit", 
            amount: depositAmt, 
            balance: vault.usdc_balance 
        });

        // Trigger market snipe evaluation upon cash deposit
        a2aSwarm.executeMarketSnipeCycle().catch((err) => console.warn("Snipe after deposit notice:", err.message));

        res.json({
            status: "FUNDED",
            message: `Deposited $${depositAmt} USDC into ${vault.name} treasury!`,
            vault: {
                id: vault.id,
                name: vault.name,
                usdc_balance: vault.usdc_balance
            },
            tx_hash: tx_hash || `0x_dep_${Date.now()}`
        });
    } catch (err) {
        console.error("Deposit treasury error:", err);
        res.status(400).json({ error: err.message });
    }
});

// WITHDRAW USDC FROM AGENT TREASURY TO OWNER WALLET
router.post("/:id/withdraw-treasury", async (req, res) => {
    try {
        const { amount, destination_account } = req.body;
        const withdrawAmt = parseFloat(amount);
        if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
            return res.status(400).json({ error: "Withdrawal amount must be a positive number." });
        }

        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        if (vault.is_locked) {
            return res.status(400).json({ error: "Vault is locked in an active trade. Cannot withdraw cash." });
        }

        if (vault.usdc_balance < withdrawAmt) {
            return res.status(400).json({ 
                error: `Insufficient treasury funds. Available: $${vault.usdc_balance} USDC, Requested: $${withdrawAmt} USDC.` 
            });
        }

        vault.usdc_balance = Math.round((vault.usdc_balance - withdrawAmt) * 100) / 100;
        const recipient = destination_account || vault.owner_account || "alierkan.testnet";

        // Append system notification to chat history
        let history = [];
        try {
            history = JSON.parse(vault.chat_history || "[]");
        } catch {}
        history.push({
            id: `msg-wd-${Date.now()}`,
            sender: "system",
            text: `Withdrew $${withdrawAmt.toLocaleString()} USDC to ${recipient}. Remaining balance: $${vault.usdc_balance.toLocaleString()} USDC.`,
            actionType: "TREASURY_WITHDRAW",
            timestamp: new Date().toISOString()
        });
        vault.chat_history = JSON.stringify(history);
        await vault.save();

        req.app.get("io")?.emit("vault:updated", { 
            vaultId: vault.id, 
            action: "treasury_withdraw", 
            amount: withdrawAmt, 
            balance: vault.usdc_balance 
        });

        res.json({
            status: "WITHDRAWN",
            message: `Withdrew $${withdrawAmt} USDC to ${recipient}`,
            vault: {
                id: vault.id,
                name: vault.name,
                usdc_balance: vault.usdc_balance
            },
            recipient
        });
    } catch (err) {
        console.error("Withdraw treasury error:", err);
        res.status(400).json({ error: err.message });
    }
});

// GET CHAT HISTORY & ACTIVE DIRECTIVES
router.get("/:id/chat", async (req, res) => {
    try {
        const chatData = await agentChatService.getVaultChat(req.params.id);
        res.json(chatData);
    } catch (err) {
        console.error("Get chat error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST CHAT MESSAGE / SET NATURAL LANGUAGE RULE
router.post("/:id/chat", async (req, res) => {
    try {
        const { message, user_account } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const reply = await agentChatService.processUserMessage(
            req.params.id, 
            message, 
            user_account || "alierkan.testnet"
        );
        res.json(reply);
    } catch (err) {
        console.error("Agent chat error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE SPECIFIC RULE OR ALL RULES
router.delete("/:id/rules", async (req, res) => {
    try {
        const { rule } = req.body;
        const result = await agentChatService.deleteRule(req.params.id, rule || "ALL");
        res.json(result);
    } catch (err) {
        console.error("Delete rule error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
