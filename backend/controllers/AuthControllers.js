import express from "express";
import rateLimit from "express-rate-limit";
import { login, signUp, adminLogin, me } from "../services/AuthServices.js";
import { checkAuthenticate } from "../middleware/authenticationCheck.js";

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/login", authLimiter, login);
router.post("/signup", authLimiter, signUp);
router.post("/admin-login", authLimiter, adminLogin);
router.get("/me", checkAuthenticate, me);

export default router;
