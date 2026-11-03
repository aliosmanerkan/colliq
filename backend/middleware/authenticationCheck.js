import jwt from "jsonwebtoken";

const token_secret = process.env.JWT_SECRET || "poke_agent_jwt_super_secret_key_2026";

export const checkAuthenticate = (req, res, next) => {
    let token = req.headers.token || req.headers.authorization || (req.cookies && req.cookies.token) || req.query?.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No authentication token provided" });
    }

    token = String(token).trim();

    if (token.toLowerCase().startsWith("bearer ")) {
        token = token.substring(7).trim();
    }

    if (token.includes(" ")) {
        const parts = token.split(" ");
        token = parts[parts.length - 1].trim();
    }

    token = token.replace(/^["']|["']$/g, "").trim();

    if (!token) {
        return res.status(401).json({ error: "Unauthorized - Empty token provided" });
    }

    jwt.verify(token, token_secret, (err, user) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized - Invalid or expired token", details: err.message });
        }
        req.user = user;
        next();
    });
};

export const checkAuthenticateAdmin = (req, res, next) => {
    let token = req.headers.admintoken || req.headers.token || req.headers.authorization || (req.cookies && req.cookies.token) || req.query?.token;

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    token = String(token).trim();
    if (token.toLowerCase().startsWith("bearer ") || token.toLowerCase().startsWith("admintoken ")) {
        token = token.replace(/^(bearer|admintoken)\s+/i, "").trim();
    }
    if (token.includes(" ")) token = token.split(" ").pop().trim();
    token = token.replace(/^["']|["']$/g, "").trim();

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, token_secret, (err, user) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        if (user.role !== "admin") return res.status(403).json({ error: "Forbidden - Admin access required" });
        req.user = user;
        next();
    });
};

export const generateAccessToken = (user) => {
    return jwt.sign(user, token_secret, { expiresIn: "30d" });
};
