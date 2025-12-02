// src/types/car.ts

export interface Car {
  id: string;
  title: string;

  // BASIC INFO
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  description: string;

  // MEDIA
  images: string[];

  // PLATFORMS
  platform: { name: string }[];

  // SELLER
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  createdAt: string;
  location: string;

  // OPTIONAL SPECS
  fuelType?: string;
  transmission?: string;
  color?: string;
  engineSize?: string;
  doors?: number;
  cylinders?: number;
  drivetrain?: string; // FWD | RWD | AWD
  bodyType?: string;   // Sedan | SUV | Coupe | etc.
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Platform {
  name: "Edmunds" | "OLX" | "Facebook Marketplace" | "AutoTrader" | "Cars.com";
  url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}
