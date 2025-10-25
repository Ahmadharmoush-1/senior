// src/routes/authRoutes.ts
import express from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = express.Router();

// Test route (optional)
router.get("/test", (_req, res) => {
  res.json({ ok: true, route: "/api/auth/test" });
});

// Register & Login routes (using controllers)
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
//
