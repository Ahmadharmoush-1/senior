// src/controllers/comparisonController.ts
import type { Response } from "express";
import { Comparison } from "../models/Comparison";
import type { AuthRequest } from "../middleware/authMiddleware";

export const saveComparison = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { carAId, carBId } = req.body as {
      carAId?: string;
      carBId?: string;
    };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!carAId || !carBId) {
      return res
        .status(400)
        .json({ message: "carAId and carBId are required" });
    }

    const comparison = await Comparison.create({
      user: userId,
      carA: carAId,
      carB: carBId,
    });

    return res.status(201).json({ success: true, comparison });
  } catch (err) {
    console.error("saveComparison error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getComparisons = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const comparisons = await Comparison.find({ user: userId })
      .populate("carA")
      .populate("carB")
      .sort({ createdAt: -1 });

    return res.json({ comparisons });
  } catch (err) {
    console.error("getComparisons error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
