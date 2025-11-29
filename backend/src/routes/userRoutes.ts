// src/routes/userRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  syncFavorites,
  getFavorites,
} from "../controllers/userController";

const router = Router();

// Sync all favorites from frontend → DB
router.post("/favorites/sync", verifyToken, syncFavorites);

// (Optional) Get favorites from DB
router.get("/favorites", verifyToken, getFavorites);

export default router;
