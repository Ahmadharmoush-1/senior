// src/utils/mapApiCarToCar.ts
import { ApiCar } from "@/api/cars";
import { Car } from "@/types/car";

export const mapApiCarToCar = (c: ApiCar): Car => {
  return {
    id: c._id,
    title: `${c.brand} ${c.model}`.trim(),

    brand: c.brand,
    model: c.model,

    // convert string → number (IMPORTANT FIX)
    year: Number(c.year),
    price: Number(c.price),
    mileage: Number(c.mileage),

    condition: c.condition,
    description: c.description,

    // STATIC FIX: prepend server URL
    images: c.images?.map((img) => `http://127.0.0.1:5000${img}`) || [],

    // platforms → objects
    platform: c.platforms?.map((p) => ({ name: p })) || [],

    // seller info
    seller: {
      id: c.seller?._id || "",
      name: c.seller?.name || "Unknown",
      email: c.seller?.email || "",
      phone: "", // backend does not give phone
    },

    // createdAt for sorting
    createdAt: c.createdAt || "",

    location: "Lebanon",

    fuelType: undefined,
    transmission: undefined,
  };
};
