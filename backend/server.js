import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import db from "./model/model.js";
import auth from "./controllers/AuthControllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    max: 1000,
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

io.on("connection", (socket) => {
    console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);

    socket.emit("connected", {
        message: "Connected to Poke Agent Socket Server",
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    socket.on("ping", () => {
        socket.emit("pong", { timestamp: Date.now() });
    });

    socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected (${socket.id}): ${reason}`);
    });
});

// Database sync
db.sequelize.sync({ alter: true }).catch((err) => {
    console.warn("⚠️ Database sync notice:", err.message);
});

// Request logger
const logger = (req, res, next) => {
    if (!req.path.includes("file") && !req.path.includes("uploads")) {
        console.log("request to ------>", req.method, req.path);
    }
    next();
};
app.use(logger);

// Health check / root route
app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "poke-agent-backend",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: "/auth",
            health: "/health"
        }
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// Routes
app.use("/auth", auth);

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error caught:", err.message);
    res.status(500).json({ error: err.message });
});

httpServer.listen(port, () => {
    console.log(`🚀 Poke Agent Backend running on port ${port}`);
    console.log(`📡 Socket.IO initialized on ws://localhost:${port}`);
});

export { io, app, httpServer };
