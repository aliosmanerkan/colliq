import express from "express";
import db from "../model/model.js";
import a2aSwarm from "../services/A2ASwarmService.js";

const router = express.Router();

// Trigger an A2A trade cycle
router.post("/trigger-swarm", async (req, res) => {
    try {
        const result = await a2aSwarm.executeNegotiationCycle();
        res.json({
            status: "SWARM_EXECUTED",
            result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET recent trade history & negotiation transcripts
router.get("/history", async (req, res) => {
    try {
        const trades = await db.trade.findAll({
            order: [["createdAt", "DESC"]],
            limit: 20
        });
        res.json({ trades });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
