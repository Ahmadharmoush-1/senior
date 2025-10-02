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
    // Search term
    if (
      filters.searchTerm &&
      !car.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !car.brand.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
      !car.model.toLowerCase().includes(filters.searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Brand filter
    if (filters.brands.length > 0 && !filters.brands.includes(car.brand)) {
      return false;
    }

    // Price range
    if (car.price < filters.minPrice || car.price > filters.maxPrice) {
      return false;
    }

    // Year range
    if (car.year < filters.minYear || car.year > filters.maxYear) {
      return false;
    }

    // Mileage range
    if (car.mileage < filters.minMileage || car.mileage > filters.maxMileage) {
      return false;
    }

    // Condition
    if (filters.conditions.length > 0 && !filters.conditions.includes(car.condition)) {
      return false;
    }

    // Fuel type
    if (filters.fuelTypes.length > 0 && car.fuelType && !filters.fuelTypes.includes(car.fuelType)) {
      return false;
    }

    // Transmission
    if (
      filters.transmissions.length > 0 &&
      car.transmission &&
      !filters.transmissions.includes(car.transmission)
    ) {
      return false;
    }

    return true;
  });

  // Sorting
  switch (filters.sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "year-desc":
      filtered.sort((a, b) => b.year - a.year);
      break;
    case "mileage-asc":
      filtered.sort((a, b) => a.mileage - b.mileage);
      break;
    case "newest":
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return filtered;
};

export const getSimilarCars = (car: Car, allCars: Car[], limit: number = 3): Car[] => {
  return allCars
    .filter((c) => c.id !== car.id)
    .map((c) => {
      let score = 0;
      
      // Same brand gets high score
      if (c.brand === car.brand) score += 3;
      
      // Similar price range (within 20%)
      const priceDiff = Math.abs(c.price - car.price) / car.price;
      if (priceDiff < 0.2) score += 2;
      
      // Similar year (within 2 years)
      const yearDiff = Math.abs(c.year - car.year);
      if (yearDiff <= 2) score += 2;
      
      // Same fuel type
      if (c.fuelType === car.fuelType) score += 1;
      
      // Same transmission
      if (c.transmission === car.transmission) score += 1;
      
      return { car: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.car);
};
