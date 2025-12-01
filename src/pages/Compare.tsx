import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { saveComparison } from "@/services/carService";

import {
  compareCarsAI,
  type CarCompareResult,
} from "@/services/aiCompareService";

import {
  estimateMaintenanceCost,
  type MaintenanceEstimate,
} from "@/services/aiMaintenanceService";

// ---------------------------------------------
// TYPES
// ---------------------------------------------
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

type CarSpecKey =
  | "price"
  | "year"
  | "mileage"
  | "condition"
  | "fuelType"
  | "transmission"
  | "location";

interface SpecItem {
  label: string;
  key: CarSpecKey;
  format?: (value: string | number | undefined) => string;
}

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
const Compare = () => {
  const navigate = useNavigate();
  const { comparisonList, removeFromComparison, clearComparison } =
    useComparison();
  const token = useAuthStore((state) => state.token);

  const [hasSaved, setHasSaved] = useState(false);

  // AI Compare
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<CarCompareResult | null>(null);

  // AI Maintenance
  const [maintLoading, setMaintLoading] = useState(false);
  const [maintenanceA, setMaintenanceA] = useState<MaintenanceEstimate | null>(
    null
  );
  const [maintenanceB, setMaintenanceB] = useState<MaintenanceEstimate | null>(
    null
  );

  // ---------------------------------------------
  // SAVE COMPARISON ONE TIME
  // ---------------------------------------------
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
      <div className="container mx-auto px-3 py-20 text-center">
        <h1 className="mb-3 text-xl font-bold">No Cars to Compare</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Add cars to your comparison list to see them side by side.
        </p>
        <Button size="sm" onClick={() => navigate("/")}>
          Browse Cars
        </Button>
      </div>
    );
  }

  // ---------------------------------------------
  // BUILD INPUT HELPERS
  // ---------------------------------------------
  const buildCompareInput = (car: Car) => {
    const parts = car.title.split(" ");
    return {
      brand: parts[0],
      model: parts.slice(1).join(" ") || parts[0],
      year: car.year,
      mileage: car.mileage,
      price: car.price,
      condition: car.condition,
    };
  };

  const buildMaintenanceInput = (car: Car) => {
    const parts = car.title.split(" ");
    return {
      brand: parts[0],
      model: parts.slice(1).join(" ") || parts[0],
      year: car.year,
      mileage: car.mileage,
      price: car.price,
      condition: car.condition,
      fuelType: car.fuelType,
      transmission: car.transmission,
    };
  };

  // ---------------------------------------------
  // AI HANDLERS
  // ---------------------------------------------
  const handleAICompare = async () => {
    if (comparisonList.length < 2) {
      alert("Add at least two cars for AI comparison.");
      return;
    }

    const [carA, carB] = comparisonList;

    try {
      setAiLoading(true);
      setAiResult(null);
      setAiResult(
        await compareCarsAI(buildCompareInput(carA), buildCompareInput(carB))
      );
    } catch (err) {
      console.error(err);
      alert("AI comparison failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIMaintenance = async () => {
    try {
      setMaintLoading(true);
      setMaintenanceA(null);
      setMaintenanceB(null);

      const resA = await estimateMaintenanceCost(
        buildMaintenanceInput(comparisonList[0])
      );
      setMaintenanceA(resA);

      if (comparisonList[1]) {
        const resB = await estimateMaintenanceCost(
          buildMaintenanceInput(comparisonList[1])
        );
        setMaintenanceB(resB);
      }
    } catch (err) {
      console.error(err);
      alert("AI maintenance estimate failed.");
    } finally {
      setMaintLoading(false);
    }
  };

  // ---------------------------------------------
  // SPECS
  // ---------------------------------------------
  const specs: SpecItem[] = [
    { label: "Price", key: "price", format: (v) => (typeof v === "number" ? `$${v}` : "N/A") },
    { label: "Year", key: "year" },
    { label: "Mileage", key: "mileage", format: (v) => `${v} mi` },
    { label: "Condition", key: "condition" },
    { label: "Fuel Type", key: "fuelType" },
    { label: "Transmission", key: "transmission" },
    { label: "Location", key: "location" },
  ];

  const primaryA = comparisonList[0];
  const primaryB = comparisonList[1];

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-4">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-xs gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </Button>

          <div className="flex gap-1">
            <Button size="sm" className="text-xs" onClick={handleAICompare}>
              {aiLoading ? "..." : "AI Compare"}
            </Button>

            <Button
              size="sm"
              className="text-xs"
              variant="outline"
              onClick={handleAIMaintenance}
            >
              {maintLoading ? "..." : "AI Maintenance"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={clearComparison}
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-lg font-bold mb-3">Compare Cars</h1>

        <div className="overflow-x-auto">
          <div className="min-w-[650px]">

            {/* IMAGES */}
            <div
              className="mb-4 grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${comparisonList.length}, 1fr)`,
              }}
            >
              {comparisonList.map((car) => (
                <Card key={car.id}>
                  <div className="relative aspect-[4/3] bg-muted">
                    <img
                      src={car.images[0]}
                      alt={car.title}
                      className="h-full w-full object-cover"
                    />

                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => removeFromComparison(car.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <CardHeader>
                    <CardTitle className="truncate text-sm">{car.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* SPECS */}
            <Card>
              <CardContent className="p-0 text-xs">
                {specs.map((spec, idx) => (
                  <div key={spec.key}>
                    {idx > 0 && <Separator />}

                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `120px repeat(${comparisonList.length}, 1fr)`,
                      }}
                    >
                      {/* LABEL */}
                      <div className="border-r p-2 font-semibold bg-muted/50">
                        {spec.label}
                      </div>

                      {/* VALUES */}
                      {comparisonList.map((car) => {
                        const v = car[spec.key];
                        const display = spec.format ? spec.format(v) : v || "N/A";

                        return (
                          <div key={car.id} className="p-2">
                            {display}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <Separator />

                {/* PLATFORMS */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `120px repeat(${comparisonList.length}, 1fr)`,
                  }}
                >
                  <div className="border-r p-2 font-semibold bg-muted/50">
                    Platforms
                  </div>

                  {comparisonList.map((car) => (
                    <div key={car.id} className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {car.platform.map((p, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {p.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* ACTIONS */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `120px repeat(${comparisonList.length}, 1fr)`,
                  }}
                >
                  <div className="border-r p-2 font-semibold bg-muted/50">
                    Actions
                  </div>

                  {comparisonList.map((car) => (
                    <div key={car.id} className="p-2">
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => navigate(`/car/${car.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI COMPARISON */}
            {aiResult && primaryA && primaryB && (
              <Card className="mt-4 text-xs">
                <CardHeader>
                  <CardTitle className="text-sm">AI Comparison Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Better Car:</strong>{" "}
                    {aiResult.betterCar === "A" ? primaryA.title : primaryB.title}
                  </p>
                  <p>
                    <strong>Reason:</strong> {aiResult.reason}
                  </p>

                  <Separator />

                  {Object.entries(aiResult.detailedComparison).map(
                    ([k, v]) => (
                      <div key={k}>
                        <strong>{k}:</strong>
                        <p className="text-muted-foreground">{v}</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI MAINTENANCE */}
            {(maintenanceA || maintenanceB) && (
              <Card className="mt-4 text-xs">
                <CardHeader>
                  <CardTitle className="text-sm">
                    AI Maintenance Estimate
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-3">
                  {primaryA && maintenanceA && (
                    <div className="border rounded-md p-2">
                      <p className="font-semibold mb-1 text-sm">{primaryA.title}</p>

                      <p>
                        <strong>Yearly Range:</strong>{" "}
                        ${maintenanceA.yearlyLow} — ${maintenanceA.yearlyHigh}
                      </p>

                      <p>
                        <strong>Budget:</strong> ${maintenanceA.recommendedYearlyBudget}/year
                      </p>

                      <p>
                        <strong>Risk:</strong>{" "}
                        {maintenanceA.riskLevel?.toUpperCase()}
                      </p>

                      <p className="text-muted-foreground mt-1">
                        {maintenanceA.summary}
                      </p>

                      <p className="mt-2 font-semibold">Common Repairs:</p>
                      <ul className="list-disc list-inside">
                        {maintenanceA.commonRepairs?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>

                      <p className="mt-2">
                        <strong>Tips:</strong> {maintenanceA.tips}
                      </p>
                    </div>
                  )}

                  {primaryB && maintenanceB && (
                    <div className="border rounded-md p-2">
                      <p className="font-semibold mb-1 text-sm">{primaryB.title}</p>

                      <p>
                        <strong>Yearly Range:</strong>{" "}
                        ${maintenanceB.yearlyLow} — ${maintenanceB.yearlyHigh}
                      </p>

                      <p>
                        <strong>Budget:</strong> ${maintenanceB.recommendedYearlyBudget}/year
                      </p>

                      <p>
                        <strong>Risk:</strong>{" "}
                        {maintenanceB.riskLevel?.toUpperCase()}
                      </p>

                      <p className="text-muted-foreground mt-1">
                        {maintenanceB.summary}
                      </p>

                      <ul className="list-disc list-inside">
                        {maintenanceB.commonRepairs?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>

                      <p className="mt-2">
                        <strong>Tips:</strong> {maintenanceB.tips}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Compare;
