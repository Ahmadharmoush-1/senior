// src/pages/Dashboard.tsx (MOBILE OPTIMIZED)
import { useState, useMemo, useEffect } from "react";
import CarCard from "@/components/CarCard";
import FilterPanel from "@/components/FilterPanel";
import { filterCars, FilterOptions } from "@/lib/filterUtils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    maxPrice: 100000,
    minYear: 2015,
    maxYear: 2025,
    minMileage: 0,
    maxMileage: 150000,
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
        setCars(apiCars.map(mapApiCarToCar));
      } catch (err) {
        console.error("Failed to load cars", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const availableBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const filteredCars = useMemo(() => filterCars(cars, filters), [cars, filters]);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative h-[260px] sm:h-[350px] overflow-hidden">
        <img
          src={heroImage}
          alt="Hero car"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60" />

        <div className="container relative mx-auto px-3 h-full flex items-center">
          <div className="max-w-lg animate-fade-in">
            <h1 className="mb-3 text-3xl sm:text-4xl font-bold leading-tight">
              Find Your Perfect Car
            </h1>

            {/* SEARCH + FILTERS */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* SEARCH INPUT */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search brand, model..."
                  className="pl-9 h-10 text-sm"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters({ ...filters, searchTerm: e.target.value })
                  }
                />
              </div>

              {/* SORT DROPDOWN */}
              <Select
                value={filters.sortBy}
                onValueChange={(value: FilterOptions["sortBy"]) =>
                  setFilters({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price Low → High</SelectItem>
                  <SelectItem value="price-desc">Price High → Low</SelectItem>
                  <SelectItem value="year-desc">Year (Newest)</SelectItem>
                  <SelectItem value="mileage-asc">Mileage (Lowest)</SelectItem>
                </SelectContent>
              </Select>

              {/* FILTER PANEL */}
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                availableBrands={availableBrands}
              />
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="container mx-auto px-3 py-8 sm:py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Available Cars</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading cars..." : `${filteredCars.length} cars found`}
          </p>
        </div>

        {/* CAR GRID */}
        {!loading && filteredCars.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : !loading ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No cars found. Try adjusting filters.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Dashboard;
