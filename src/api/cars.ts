// src/api/cars.ts
import axios from "axios";

export const API_BASE_URL = "http://127.0.0.1:5000";
const API_URL = `${API_BASE_URL}/api/cars`;

export interface ApiCar {
  _id: string;
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  description: string;
  condition: "new" | "used" | "certified";
  images: string[];
  platforms: string[];
  phone?: string;
  facebookUrl?: string;
  sold?: boolean;
  soldAt?: string;

  fuelType?: string;
  transmission?: string;
  color?: string;
  engineSize?: string;
  doors?: number | string;
  cylinders?: number | string;
  drivetrain?: string;
  bodyType?: string;

  seller?: {
    _id?: string;
    name?: string;
    email?: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

// CREATE CAR
export const createCar = async (formData: FormData, token: string) => {
  const res = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// GET ALL CARS
export const getAllCars = async (): Promise<ApiCar[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

// GET CAR BY ID
export const getCarById = async (id: string): Promise<ApiCar> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// MY CARS
export const getMyCars = async (token: string): Promise<ApiCar[]> => {
  const res = await axios.get(`${API_URL}/me/listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// UPDATE CAR
export const updateCar = async (id: string, formData: FormData, token: string) => {
  const res = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// DELETE CAR
export const deleteCar = async (id: string, token: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ⭐ MARK CAR AS SOLD
export const markCarSold = async (id: string, token: string) => {
  const res = await axios.put(
    `${API_URL}/${id}/sold`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
