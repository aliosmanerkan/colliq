import express from "express";
import db from "../model/model.js";
import { generateVaultDynamicSvg } from "../services/DynamicSvgService.js";
import nearService from "../services/NearService.js";
import agentChatService from "../services/AgentChatService.js";
import agentInceptionService from "../services/AgentInceptionService.js";

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

        // Generate unique sub-account: <name-slug>-<unique-hash>.vaultdeck.testnet
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

        res.status(201).json({
            status: "MINTED",
            vault: newVault,
            accessKey: keyPair
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

// AGENT SNIPES / BUYS A CARD FROM THE MARKETPLACE
router.post("/:id/snipe", async (req, res) => {
    try {
        const { card_id } = req.body;
        const vault = await db.vault.findOne({ where: getVaultWhere(req.params.id) });
        if (!vault) return res.status(404).json({ error: "Vault not found" });

        const { bridgeCollectorCryptCardToNearVault } = await import("../services/CollectorCryptService.js");
        const result = await bridgeCollectorCryptCardToNearVault(card_id, vault.id, vault.sub_account);

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

        const card = await db.card.findOne({ where: { card_id, vault_id: vault.id } });
        if (!card) return res.status(404).json({ error: "Card not in this vault" });

        card.vault_id = null;
        card.owner_account = destination_account || vault.owner_account;
        await card.save();

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
