import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import db from "./model/model.js";
import auth from "./controllers/AuthControllers.js";
import vaults from "./controllers/VaultControllers.js";
import trades from "./controllers/TradeControllers.js";
import market from "./controllers/MarketControllers.js";
import { seedInitialVaultsAndCards } from "./services/CollectorCryptService.js";
import a2aSwarm from "./services/A2ASwarmService.js";
import negotiationEngine from "./src/agents/negotiationEngine.ts";
import agentChatService from "./services/AgentChatService.js";

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5001;

// Security & CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(cookieParser());
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Global Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use(limiter);

// Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.set("io", io);
a2aSwarm.setSocket(io);
negotiationEngine.setSocket(io);
agentChatService.setSocket(io);

io.on("connection", (socket) => {
    console.log(`⚡ Client connected to VaultDeck Live Floor: ${socket.id}`);

    socket.emit("connected", {
        message: "Connected to VaultDeck A2A Swarm Exchange",
        socketId: socket.id,
        network: "NEAR Testnet",
        timestamp: new Date().toISOString()
    });

    socket.on("trigger_a2a_cycle", async () => {
        console.log(`🤖 Manual A2A Cycle triggered by socket client: ${socket.id}`);
        await a2aSwarm.executeNegotiationCycle();
    });

    socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected (${socket.id}): ${reason}`);
    });
});

// Database sync and initial seed
db.sequelize.sync({ alter: true })
    .then(async () => {
        console.log("🗄️ Database synchronized successfully.");
        await seedInitialVaultsAndCards();
    })
    .catch((err) => {
        console.warn("⚠️ Database sync notice:", err.message);
    });

// Request logger
const logger = (req, res, next) => {
    if (!req.path.includes("file") && !req.path.includes("uploads") && !req.path.includes("svg")) {
        console.log("request to ------>", req.method, req.path);
    }
    next();
};
app.use(logger);

// Root route
app.get("/", (req, res) => {
    res.json({
        service: "VaultDeck • Autonomous Merchant Vaults Protocol",
        chain: "NEAR Protocol (Track 10: NFTs as Accounts)",
        version: "1.0.0",
        endpoints: {
            vaults: "/vaults",
            trades: "/trades",
            market: "/market",
            health: "/health"
        }
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime(), network: "NEAR Testnet" });
});

// Routes
app.use("/auth", auth);
app.use("/vaults", vaults);
app.use("/trades", trades);
app.use("/market", market);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error caught:", err.message);
    res.status(500).json({ error: err.message });
});

httpServer.listen(port, () => {
    console.log(`🚀 VaultDeck Protocol Backend running on port ${port}`);
    console.log(`📡 A2A Swarm Live Exchange ws://localhost:${port}`);
});

export { io, app, httpServer };
