// src/pages/Dashboard.tsx
import { useState, useMemo, useEffect } from "react";
import CarCard from "@/components/CarCard";
import FilterPanel from "@/components/FilterPanel";
import { filterCars, FilterOptions } from "@/lib/filterUtils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";
import { getAllCars } from "@/api/cars";
import type { Car as CarType } from "@/types/car";
import { mapApiCarToCar } from "@/utils/mapApiCarToCar";

const Dashboard = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    brands: [],
    minPrice: 0,
    maxPrice: 1_000_000,
    minYear: 0,
    maxYear: new Date().getFullYear() + 1,
    minMileage: 0,
    maxMileage: 1_000_000,
    conditions: [],
    fuelTypes: [],
    transmissions: [],
    sortBy: "newest",
  });

  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const apiCars = await getAllCars();
        console.log("🚗 API cars:", apiCars);
        const mapped = apiCars.map(mapApiCarToCar);
        console.log("🚗 Mapped cars:", mapped);
        setCars(mapped);
      } catch (err) {
        console.error("Failed to load cars", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const availableBrands = useMemo(
    () => Array.from(new Set(cars.map((c) => c.brand))).sort(),
    [cars]
  );

  const filteredCars = useMemo(
    () => filterCars(cars, filters),
    [cars, filters]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src={heroImage}
          alt="Hero car"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60" />
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="mb-4 text-5xl font-bold">Find Your Perfect Car</h1>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search by brand, model, or keyword..."
                  className="pl-10 h-12 text-base"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                />
              </div>

              {/* Sort */}
              <Select
                value={filters.sortBy}
                onValueChange={(value: FilterOptions["sortBy"]) =>
                  setFilters({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[200px] h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="year-desc">Year: Newest</SelectItem>
                  <SelectItem value="mileage-asc">Mileage: Lowest</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters */}
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                availableBrands={availableBrands}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Car Listings */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Available Cars</h2>
          <p className="mt-2 text-muted-foreground">
            {loading ? "Loading cars..." : `${filteredCars.length} cars found`}
          </p>
        </div>

        {!loading && filteredCars.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : !loading ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No cars found. Try changing your filters.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Dashboard;
