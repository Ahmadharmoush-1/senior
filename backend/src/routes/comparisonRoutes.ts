// src/routes/comparisonRoutes.ts
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  saveComparison,
  getComparisons,
} from "../controllers/comparisonController";

const router = Router();

// Save a comparison (two cars)
router.post("/", verifyToken, saveComparison);

// Get comparison history (optional)
router.get("/", verifyToken, getComparisons);

export default router;
