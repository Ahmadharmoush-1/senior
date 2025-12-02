// src/components/FilterPanel.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterOptions } from "@/lib/filterUtils";
import { Badge } from "@/components/ui/badge";

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBrands: string[];
}

const FilterPanel = ({ filters, onFiltersChange, availableBrands }: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggle = (key: string, value: string) => {
    const list = localFilters[key as keyof FilterOptions] as string[];
    const updated = list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];

    setLocalFilters({ ...localFilters, [key]: updated });
  };

  const applyFilters = () => onFiltersChange(localFilters);

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      searchTerm: "",
      brands: [],
      minPrice: 0,
      maxPrice: 100000,
      minYear: 2000,
      maxYear: new Date().getFullYear(),
      minMileage: 0,
      maxMileage: 200000,
      conditions: [],
      fuelTypes: [],
      transmissions: [],
      sortBy: "newest",
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount =
    localFilters.brands.length +
    localFilters.conditions.length +
    localFilters.fuelTypes.length +
    localFilters.transmissions.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Cars</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          
          {/* Brand */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Brand</Label>
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  checked={localFilters.brands.includes(brand)}
                  onCheckedChange={() => toggle("brands", brand)}
                />
                <label className="text-sm cursor-pointer">{brand}</label>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Price: ${localFilters.minPrice.toLocaleString()} - ${localFilters.maxPrice.toLocaleString()}
            </Label>
            <Slider
              min={0}
              max={100000}
              step={1000}
              value={[localFilters.minPrice, localFilters.maxPrice]}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, minPrice: value[0], maxPrice: value[1] })
              }
            />
          </div>

          {/* Year */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Year: {localFilters.minYear} - {localFilters.maxYear}
            </Label>
            <Slider
              min={1990}
              max={new Date().getFullYear()}
              step={1}
              value={[localFilters.minYear, localFilters.maxYear]}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, minYear: value[0], maxYear: value[1] })
              }
            />
          </div>

          {/* Mileage */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Mileage: {localFilters.minMileage.toLocaleString()} - {localFilters.maxMileage.toLocaleString()} mi
            </Label>
            <Slider
              min={0}
              max={200000}
              step={5000}
              value={[localFilters.minMileage, localFilters.maxMileage]}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, minMileage: value[0], maxMileage: value[1] })
              }
            />
          </div>

          {/* Condition */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Condition</Label>
            {["new", "used", "certified"].map((c) => (
              <div key={c} className="flex items-center space-x-2">
                <Checkbox
                  checked={localFilters.conditions.includes(c)}
                  onCheckedChange={() => toggle("conditions", c)}
                />
                <label className="capitalize text-sm cursor-pointer">{c}</label>
              </div>
            ))}
          </div>

          {/* Fuel Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Fuel Type</Label>
            {["gasoline", "diesel", "electric", "hybrid"].map((fuel) => (
              <div key={fuel} className="flex items-center space-x-2">
                <Checkbox
                  checked={localFilters.fuelTypes.includes(fuel)}
                  onCheckedChange={() => toggle("fuelTypes", fuel)}
                />
                <label className="capitalize text-sm cursor-pointer">{fuel}</label>
              </div>
            ))}
          </div>

          {/* Transmission */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Transmission</Label>
            {["automatic", "manual"].map((t) => (
              <div key={t} className="flex items-center space-x-2">
                <Checkbox
                  checked={localFilters.transmissions.includes(t)}
                  onCheckedChange={() => toggle("transmissions", t)}
                />
                <label className="capitalize text-sm cursor-pointer">{t}</label>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={resetFilters} className="flex-1">
              <X className="h-4 w-4 mr-2" /> Reset
            </Button>
            <Button variant="default" onClick={applyFilters} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
