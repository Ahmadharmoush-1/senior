// src/services/carService.ts
import axios from "@/lib/axios";

export async function createCar(formData: FormData, token: string) {
  if (!token) throw new Error("Missing auth token");

  const res = await axios.post("/cars", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function getCars() {
  const res = await axios.get("/cars");
  return res.data.cars; // depends on your backend response shape
}

export async function getCarById(id: string) {
  const res = await axios.get(`/cars/${id}`);
  return res.data.car ?? res.data;
}

// ⭐ NEW: Sync favorites (array of car IDs) with backend
export async function syncFavorites(carIds: string[], token: string) {
  if (!token) throw new Error("Missing auth token");

  await axios.post(
    "/user/favorites/sync",
    { carIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// ⭐ NEW: Save a comparison (two car IDs)
export async function saveComparison(carAId: string, carBId: string, token: string) {
  return axios.post(
    "/api/comparisons",
    { carAId, carBId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

