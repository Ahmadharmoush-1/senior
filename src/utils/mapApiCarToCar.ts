// src/utils/mapApiCarToCar.ts
import { ApiCar } from "@/api/cars";
import { Car } from "@/types/car";

export const mapApiCarToCar = (c: ApiCar): Car => {
  return {
    id: c._id,
    title: `${c.brand} ${c.model}`.trim(),

    brand: c.brand,
    model: c.model,

    year: Number(c.year),
    price: Number(c.price),
    mileage: Number(c.mileage),

    condition: c.condition,
    description: c.description,

    images: c.images?.map((img) => `http://127.0.0.1:5000${img}`) || [],

    platform: c.platforms?.map((p) => ({ name: p })) || [],

    seller: {
      id: c.seller?._id || "",
      name: c.seller?.name || "Unknown",
      email: c.seller?.email || "",
      phone: c.phone || "",
    },

    createdAt: c.createdAt || "",
    location: "Lebanon",

    fuelType: c.fuelType,
    transmission: c.transmission,
    color: c.color,
    engineSize: c.engineSize,
    doors: c.doors ? Number(c.doors) : undefined,
    cylinders: c.cylinders ? Number(c.cylinders) : undefined,
    drivetrain: c.drivetrain,
    bodyType: c.bodyType,

    // ⭐ FIX: ADD SOLD DATA
    sold: c.sold ?? false,
    soldAt: c.soldAt || "",
  };
};
