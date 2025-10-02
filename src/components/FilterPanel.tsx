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

  const handleBrandToggle = (brand: string) => {
    const newBrands = localFilters.brands.includes(brand)
      ? localFilters.brands.filter((b) => b !== brand)
      : [...localFilters.brands, brand];
    setLocalFilters({ ...localFilters, brands: newBrands });
  };

  const handleConditionToggle = (condition: string) => {
    const newConditions = localFilters.conditions.includes(condition)
      ? localFilters.conditions.filter((c) => c !== condition)
      : [...localFilters.conditions, condition];
    setLocalFilters({ ...localFilters, conditions: newConditions });
  };

  const handleFuelTypeToggle = (fuelType: string) => {
    const newFuelTypes = localFilters.fuelTypes.includes(fuelType)
      ? localFilters.fuelTypes.filter((f) => f !== fuelType)
      : [...localFilters.fuelTypes, fuelType];
    setLocalFilters({ ...localFilters, fuelTypes: newFuelTypes });
  };

  const handleTransmissionToggle = (transmission: string) => {
    const newTransmissions = localFilters.transmissions.includes(transmission)
      ? localFilters.transmissions.filter((t) => t !== transmission)
      : [...localFilters.transmissions, transmission];
    setLocalFilters({ ...localFilters, transmissions: newTransmissions });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
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
            <div className="space-y-2">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={localFilters.brands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Price Range: ${localFilters.minPrice.toLocaleString()} - $
              {localFilters.maxPrice.toLocaleString()}
            </Label>
            <Slider
              min={0}
              max={100000}
              step={5000}
              value={[localFilters.minPrice, localFilters.maxPrice]}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, minPrice: value[0], maxPrice: value[1] })
              }
            />
          </div>

          {/* Year Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Year: {localFilters.minYear} - {localFilters.maxYear}
            </Label>
            <Slider
              min={2015}
              max={2025}
              step={1}
              value={[localFilters.minYear, localFilters.maxYear]}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, minYear: value[0], maxYear: value[1] })
              }
            />
          </div>

          {/* Mileage Range */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Mileage: {localFilters.minMileage.toLocaleString()} -{" "}
              {localFilters.maxMileage.toLocaleString()} mi
            </Label>
            <Slider
              min={0}
              max={150000}
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
            <div className="space-y-2">
              {["new", "used", "certified"].map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={localFilters.conditions.includes(condition)}
                    onCheckedChange={() => handleConditionToggle(condition)}
                  />
                  <label htmlFor={`condition-${condition}`} className="text-sm cursor-pointer capitalize">
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Fuel Type</Label>
            <div className="space-y-2">
              {["gasoline", "diesel", "electric", "hybrid"].map((fuel) => (
                <div key={fuel} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fuel-${fuel}`}
                    checked={localFilters.fuelTypes.includes(fuel)}
                    onCheckedChange={() => handleFuelTypeToggle(fuel)}
                  />
                  <label htmlFor={`fuel-${fuel}`} className="text-sm cursor-pointer capitalize">
                    {fuel}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Transmission</Label>
            <div className="space-y-2">
              {["automatic", "manual"].map((trans) => (
                <div key={trans} className="flex items-center space-x-2">
                  <Checkbox
                    id={`trans-${trans}`}
                    checked={localFilters.transmissions.includes(trans)}
                    onCheckedChange={() => handleTransmissionToggle(trans)}
                  />
                  <label htmlFor={`trans-${trans}`} className="text-sm cursor-pointer capitalize">
                    {trans}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={resetFilters} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="default" onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
