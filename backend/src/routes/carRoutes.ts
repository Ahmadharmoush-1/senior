import { Router } from "express";
import {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  getMyCars,
  markCarSold,
} from "../controllers/carController";

import { verifyToken } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

// PUBLIC ROUTES
router.get("/", getAllCars);
router.get("/:id", getCarById);

// PRIVATE ROUTES
router.get("/me/listings", verifyToken, getMyCars);
router.post("/", verifyToken, upload.array("images", 10), createCar);
router.put("/:id", verifyToken, upload.array("images", 10), updateCar);
router.delete("/:id", verifyToken, deleteCar);

// NEW: MARK AS SOLD
router.put("/:id/sold", verifyToken, markCarSold);

export default router;
