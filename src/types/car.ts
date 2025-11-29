export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  description: string;
  images: string[];
  platform: { name: string }[];
  seller: { id: string; name: string; email: string; phone: string };
  createdAt: string;
  location: string;
  fuelType?: string;
  transmission?: string;
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
