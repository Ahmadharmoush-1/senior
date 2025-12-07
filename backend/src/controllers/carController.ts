import { Request, Response } from "express";
import { Car } from "../models/Car";
import { AuthRequest } from "../middleware/authMiddleware";

export const createCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id)
      return res.status(401).json({ message: "Unauthorized" });

    const {
      brand,
      model,
      year,
      price,
      mileage,
      platforms,
      description,
      condition,
      facebookUrl,

      // optional specs
      fuelType,
      transmission,
      color,
      engineSize,
      doors,
      cylinder,
      drivetrain,
      bodyType,

      // NEW FIELD
      phone,
    } = req.body;

    const images = req.files
      ? (req.files as Express.Multer.File[]).map(
          (f) => `/uploads/${f.filename}`
        )
      : [];

    const car = await Car.create({
      brand,
      model,
      year,
      price,
      mileage,
      platforms,
      description,
      condition,
      images,
      facebookUrl,
      seller: req.user.id,

      // optional
      fuelType,
      transmission,
      color,
      engineSize,
      doors,
      cylinder,
      drivetrain,
      bodyType,

      phone,
    });

    const populated = await car.populate("seller", "name email");
    res.status(201).json(populated);
  } catch (err) {
    console.error("Create Car Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCars = async (_req: Request, res: Response) => {
  try {
    const cars = await Car.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(cars);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const getCarById = async (req: Request, res: Response) => {
  try {
    const car = await Car.findById(req.params.id).populate("seller", "name email");
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let newImages = car.images;
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      newImages = (req.files as Express.Multer.File[]).map(
        (f) => `/uploads/${f.filename}`
      );
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images: newImages },
      { new: true }
    ).populate("seller", "name email");

    res.json(updatedCar);
  } catch (err) {
    console.error("Update Car Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await car.deleteOne();
    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error("Delete Car Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyCars = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const cars = await Car.find({ seller: req.user.id })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(cars);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ⭐ NEW FEATURE — MARK AS SOLD
export const markCarSold = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (car.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    car.sold = true;
    car.soldAt = new Date();
    await car.save();

    const populated = await car.populate("seller", "name email");

    res.json({ message: "Car marked as sold", car: populated });
  } catch (err) {
    console.error("Mark Car Sold Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
