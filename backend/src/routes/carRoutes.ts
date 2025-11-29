import { Router } from "express";
import {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
  getMyCars,
} from "../controllers/carController";
import { verifyToken } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

// public
router.get("/", getAllCars);
router.get("/:id", getCarById);

// private
router.get("/me/listings", verifyToken, getMyCars);
router.post("/", verifyToken, upload.array("images", 10), createCar);
router.put("/:id", verifyToken, upload.array("images", 10), updateCar);
router.delete("/:id", verifyToken, deleteCar);

export default router;
