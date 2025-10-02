import { useState, useMemo } from "react";
import CarCard from "@/components/CarCard";
import FilterPanel from "@/components/FilterPanel";
import { mockCars } from "@/lib/mockData";
import { filterCars, FilterOptions } from "@/lib/filterUtils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";

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

  const availableBrands = useMemo(() => {
    return Array.from(new Set(mockCars.map((car) => car.brand))).sort();
  }, []);

  const filteredCars = useMemo(() => {
    return filterCars(mockCars, filters);
  }, [filters]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Hero car"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/60" />
        </div>
        
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="mb-4 text-5xl font-bold text-foreground md:text-6xl">
              Find Your Perfect Car
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Browse thousands of cars from multiple platforms in one place
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by brand, model, or keyword..."
                  className="pl-10 h-12 text-base"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                />
              </div>
              <Select
                value={filters.sortBy}
                onValueChange={(value: "newest" | "price-asc" | "price-desc" | "year-desc" | "mileage-asc") =>
                  setFilters({ ...filters, sortBy: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[200px] h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="year-desc">Year: Newest</SelectItem>
                  <SelectItem value="mileage-asc">Mileage: Lowest</SelectItem>
                </SelectContent>
              </Select>
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
          <h2 className="text-3xl font-bold text-foreground">
            Available Cars
          </h2>
          <p className="mt-2 text-muted-foreground">
            {filteredCars.length} {filteredCars.length === 1 ? "car" : "cars"} found
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No cars found matching your search. Try a different keyword.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
