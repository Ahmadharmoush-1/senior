import { Request, Response } from "express";
import { scrapeFacebookMarketplace } from "../services/facebookScraper";
import { AuthRequest } from "../middleware/authMiddleware";
import { Car } from "../models/Car";

export const previewFacebookListing = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || !url.includes("facebook.com/marketplace")) {
    return res.status(400).json({ message: "Invalid Facebook Marketplace URL" });
  }

  try {
    const data = await scrapeFacebookMarketplace(url);
    return res.json(data);
  } catch (err) {
    console.error("Preview scrape error:", err);
    return res.status(500).json({
      message: "Facebook blocked scraping or listing is private.",
    });
  }
};


export const importFacebookListing = async (req: AuthRequest, res: Response) => {
  const { url } = req.body;
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

  if (!url || !url.includes("facebook.com/marketplace")) {
    return res.status(400).json({ message: "Invalid Facebook Marketplace URL" });
  }

  try {
    const data = await scrapeFacebookMarketplace(url);

    const parts = data.title.split(" ");
    const brand = parts[0] || "Unknown";
    const model = parts.slice(1).join(" ") || "Unknown";

    const car = await Car.create({
      brand,
      model,
      price: data.price ?? 0,
      mileage: 0,
      year: new Date().getFullYear(),
      platforms: ["facebook"],
      description: data.description,
      condition: "used",
      images: data.images,
      seller: req.user.id,
      facebookSource: {
        url,
        externalId: data.externalId,
        importedAt: new Date(),
        lastSyncedAt: new Date(),
      },
    });

    const populated = await car.populate("seller", "name email");
    return res.status(201).json(populated);
  } catch (err) {
    console.error("Import scrape error:", err);
    return res.status(500).json({
      message: "Facebook blocked scraping or listing is private.",
    });
  }
};
