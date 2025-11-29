// src/pages/Compare.tsx
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react"; // ⭐ NEW
import { useAuthStore } from "@/stores/authStore"; // ⭐ NEW
import { saveComparison } from "@/services/carService"; // ⭐ NEW

interface Platform {
  name: string;
}

interface Car {
  id: string;
  title: string;
  images: string[];
  price: number;
  year: number;
  mileage: number;
  condition: string;
  fuelType?: string;
  transmission?: string;
  location?: string;
  platform: Platform[];
}

const Compare = () => {
  const navigate = useNavigate();
  const { comparisonList, removeFromComparison, clearComparison } =
    useComparison();
  const token = useAuthStore((state) => state.token); // ⭐ token from store
  const [hasSaved, setHasSaved] = useState(false); // ⭐ avoid duplicate saves

  // ⭐ Save comparison (first two cars) in DB once
  useEffect(() => {
    const doSave = async () => {
      if (!token) return;
      if (comparisonList.length < 2) return;
      if (hasSaved) return;

      const [carA, carB] = comparisonList;

      try {
        await saveComparison(carA.id, carB.id, token);
        setHasSaved(true);
      } catch (err) {
        console.error("Failed to save comparison:", err);
      }
    };

    void doSave();
  }, [comparisonList, token, hasSaved]);

  if (comparisonList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">No Cars to Compare</h1>
        <p className="mb-6 text-muted-foreground">
          Add cars to your comparison list to see them side by side.
        </p>
        <Button onClick={() => navigate("/")} variant="default">
          Browse Cars
        </Button>
      </div>
    );
  }

  const specs: Array<{
    label: string;
    key: keyof Car;
    format?: (val: number | string | undefined) => string;
  }> = [
    {
      label: "Price",
      key: "price",
      format: (val: number) => `$${val.toLocaleString()}`,
    },
    { label: "Year", key: "year" },
    {
      label: "Mileage",
      key: "mileage",
      format: (val: number) => `${val.toLocaleString()} mi`,
    },
    {
      label: "Condition",
      key: "condition",
      format: (val: string) =>
        val.charAt(0).toUpperCase() + val.slice(1),
    },
    {
      label: "Fuel Type",
      key: "fuelType",
      format: (val: string) =>
        val ? val.charAt(0).toUpperCase() + val.slice(1) : "N/A",
    },
    {
      label: "Transmission",
      key: "transmission",
      format: (val: string) =>
        val ? val.charAt(0).toUpperCase() + val.slice(1) : "N/A",
    },
    { label: "Location", key: "location" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listings
          </Button>
          <Button
            variant="outline"
            onClick={clearComparison}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Compare Cars</h1>
          <p className="mt-2 text-muted-foreground">
            Compare up to {comparisonList.length} of 3 cars side by side
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Car Images & Titles */}
            <div
              className="mb-6 grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)`,
              }}
            >
              {comparisonList.map((car) => (
                <Card key={car.id} className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 bg-card/90 backdrop-blur-sm"
                      onClick={() => removeFromComparison(car.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader>
                    <CardTitle className="truncate text-base">
                      {car.title}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardContent className="p-0">
                {specs.map((spec, index) => (
                  <div key={spec.key}>
                    {index > 0 && <Separator />}
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `200px repeat(${comparisonList.length}, 1fr)`,
                      }}
                    >
                      <div className="border-r p-4 font-semibold text-sm bg-muted/50">
                        {spec.label}
                      </div>
                      {comparisonList.map((car) => {
                        const value = car[spec.key];
                        let displayValue: string | number | undefined;

                        if (
                          spec.format &&
                          (typeof value === "string" ||
                            typeof value === "number")
                        ) {
                          displayValue = spec.format(value);
                        } else if (
                          typeof value === "string" ||
                          typeof value === "number"
                        ) {
                          displayValue = value;
                        } else {
                          displayValue = "N/A";
                        }

                        return (
                          <div key={car.id} className="p-4 text-sm">
                            {displayValue || "N/A"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Platforms */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `200px repeat(${comparisonList.length}, 1fr)`,
                  }}
                >
                  <div className="border-r p-4 font-semibold text-sm bg-muted/50">
                    Listed On
                  </div>
                  {comparisonList.map((car) => (
                    <div key={car.id} className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {car.platform.map((platform, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {platform.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* View Details Buttons */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `200px repeat(${comparisonList.length}, 1fr)`,
                  }}
                >
                  <div className="border-r p-4 font-semibold text-sm bg-muted/50">
                    Actions
                  </div>
                  {comparisonList.map((car) => (
                    <div key={car.id} className="p-4">
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => navigate(`/car/${car.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
