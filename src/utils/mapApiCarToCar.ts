// src/utils/mapApiCarToCar.ts
import { ApiCar } from "@/api/cars";
import { Car } from "@/types/car";

export const mapApiCarToCar = (c: ApiCar): Car => {
  return {
    id: c._id,
    title: `${c.brand} ${c.model}`,
    brand: c.brand,
    model: c.model,
    year: c.year,
    price: c.price,
    mileage: c.mileage,
    condition: c.condition,
    description: c.description,

    // FIX IMAGE URLS
    images: c.images?.map((img) => `http://127.0.0.1:5000${img}`) || [],

    platform: c.platforms?.map((p) => ({ name: p })) || [],

    seller: {
      id: c.seller?._id || "",
      name: c.seller?.name || "Unknown",
      email: c.seller?.email || "",
      phone: "", // backend does not provide phone
    },

    createdAt: c.createdAt || "",
    location: "Lebanon",
    fuelType: undefined,
    transmission: undefined,
  };
};
