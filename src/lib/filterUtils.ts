// src/lib/filterUtils.ts
import { Car } from "@/types/car";

export interface FilterOptions {
  searchTerm: string;
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  minMileage: number;
  maxMileage: number;
  conditions: string[];
  fuelTypes: string[];
  transmissions: string[];
  sortBy: "price-asc" | "price-desc" | "year-desc" | "mileage-asc" | "newest";
}

export const filterCars = (cars: Car[], filters: FilterOptions): Car[] => {
  const filtered = cars.filter((car) => {
    const year = Number(car.year);
    const price = Number(car.price);
    const mileage = Number(car.mileage);

    // 🔍 Search
    if (
      filters.searchTerm &&
      !car.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !car.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !car.model.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Brand
    if (filters.brands.length > 0 && !filters.brands.includes(car.brand)) {
      return false;
    }

    // Price
    if (price < filters.minPrice || price > filters.maxPrice) {
      return false;
    }

    // Year
    if (year < filters.minYear || year > filters.maxYear) {
      return false;
    }

    // Mileage
    if (mileage < filters.minMileage || mileage > filters.maxMileage) {
      return false;
    }

    // Condition
    if (filters.conditions.length > 0 && !filters.conditions.includes(car.condition)) {
      return false;
    }

    return true;
  });

  // Sorting
  switch (filters.sortBy) {
    case "price-asc":
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price-desc":
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "year-desc":
      filtered.sort((a, b) => Number(b.year) - Number(a.year));
      break;
    case "mileage-asc":
      filtered.sort((a, b) => Number(a.mileage) - Number(b.mileage));
      break;
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  return filtered;
};
