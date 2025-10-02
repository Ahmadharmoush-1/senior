export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  description: string;
  condition: "new" | "used" | "certified";
  fuelType?: "gasoline" | "diesel" | "electric" | "hybrid";
  transmission?: "automatic" | "manual";
  images: string[];
  platform: Platform[];
  seller: Seller;
  createdAt: string;
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
