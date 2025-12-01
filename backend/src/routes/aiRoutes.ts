// src/routes/aiRoutes.ts
import express from "express";
import { predictPrice } from "../controllers/aiController";
import { compareCars } from "../controllers/aiCompareController";
import { estimateMaintenance } from "../controllers/aiMaintenanceController";

const router = express.Router();

// AI Price
router.post("/price", predictPrice);

// AI Car Comparison
router.post("/compare", compareCars);

// AI Maintenance
router.post("/maintenance", estimateMaintenance);

export default router;
