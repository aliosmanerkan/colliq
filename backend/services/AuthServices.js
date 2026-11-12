import db from "../model/model.js";
import hashPassword from "../utils/hash.js";
import { generateAccessToken } from "../middleware/authenticationCheck.js";

const formatUserResponse = (user) => {
    const json = typeof user.toJSON === "function" ? user.toJSON() : { ...user };
    delete json.password;
    json.name = json.name || json.fullname || "";
    json.displayName = json.displayName || json.name || (json.email ? json.email.split("@")[0] : "");
    json.photoURL = json.photoURL || "";
    return json;
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await db.user.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.is_suspended) {
            return res.status(403).json({ error: "Account suspended" });
        }

        if (user.password !== hashPassword(email, password)) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const userResponse = formatUserResponse(user);
        const token = generateAccessToken(userResponse);
        userResponse.token = token;

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ token, user: userResponse });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const signUp = async (req, res) => {
    try {
        const { email, password, name, fullname } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const existing = await db.user.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = hashPassword(email, password);
        const newUser = await db.user.create({
            email,
            password: hashedPassword,
            name: name || fullname || "",
            fullname: fullname || name || "",
            role: "user"
        });

        const userResponse = formatUserResponse(newUser);
        const token = generateAccessToken(userResponse);
        userResponse.token = token;

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({ token, user: userResponse });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { password } = req.body;
        const validPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (password !== validPassword) {
            return res.status(401).json({ error: "Invalid admin password" });
        }

        const adminPayload = {
            id: 0,
            email: "admin@colliq.fun",
            role: "admin",
            name: "Super Admin"
        };
        const token = generateAccessToken(adminPayload);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ token, user: adminPayload });
    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const me = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
