import express from "express";
import { login, register, verifyOtpLogin } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);

// step 1: password login → sends otp
router.post("/login", login);

// step 2: verify otp → returns token
router.post("/verify-otp", verifyOtpLogin);

export default router;
