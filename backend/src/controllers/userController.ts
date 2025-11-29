// src/controllers/userController.ts
import type { Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import type { AuthRequest } from "../middleware/authMiddleware";

export const syncFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { carIds } = req.body as { carIds?: string[] };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!carIds || !Array.isArray(carIds)) {
      return res.status(400).json({ message: "carIds must be an array" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const objectIds = carIds.map((id) => new mongoose.Types.ObjectId(id));
    user.favorites = objectIds;

    await user.save();

    return res.json({
      success: true,
      favorites: user.favorites.map((id) => id.toString()),
    });
  } catch (err) {
    console.error("syncFavorites error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate("favorites");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("getFavorites error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
