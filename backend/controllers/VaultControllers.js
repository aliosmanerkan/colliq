import express from "express";
import db from "../model/model.js";
import { generateVaultDynamicSvg } from "../services/DynamicSvgService.js";
import nearService from "../services/NearService.js";

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
            where: { id: req.params.id },
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
            where: { id: req.params.id },
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

// MINT new Merchant Vault NFT
router.post("/mint", async (req, res) => {
    try {
        const { name, owner_account, usdc_deposit, strategy, guardrail_max_spend, bio } = req.body;
        if (!name || !owner_account) {
            return res.status(400).json({ error: "Name and owner_account are required" });
        }

        const count = await db.vault.count();
        const nextId = count + 1;
        const subAccount = nearService.generateSubAccount(nextId);
        const keyPair = nearService.generateAgentFunctionCallKey(subAccount);

        const newVault = await db.vault.create({
            vault_id: `vault-${nextId}`,
            sub_account: subAccount,
            name,
            owner_account,
            usdc_balance: Number(usdc_deposit) || 500.0,
            strategy: strategy || "BALANCED_TRADER",
            tier: "ROOKIE",
            guardrail_max_spend_per_trade: Number(guardrail_max_spend) || 300.0,
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

export default router;
