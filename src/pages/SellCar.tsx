// src/pages/SellCar.tsx (MOBILE OPTIMIZED)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  Upload,
  X,
  Link2,
  Loader2,
} from "lucide-react";

import { createCar } from "@/api/cars";
import axios from "axios";
import { predictCarPrice } from "@/services/aiService";

const platforms = [
  { id: "edmunds", name: "Edmunds" },
  { id: "olx", name: "OLX" },
  { id: "facebook", name: "Facebook Marketplace" },
  { id: "autotrader", name: "AutoTrader" },
  { id: "cars", name: "Cars.com" },
];

const FB_SCRAPE_URL = "http://127.0.0.1:5000/api/scrape/facebook";

type FacebookScrapeResult = Partial<{
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  condition: "new" | "used" | "certified" | string;
  description: string;
  images: string[];
  platforms: string[];
}>;

type AiPriceResult = {
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  marketSummary: string;
};

const SellCar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    condition: "",
    description: "",
    platforms: [] as string[],
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [fbUrl, setFbUrl] = useState("");
  const [isImportingFb, setIsImportingFb] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiPriceResult | null>(null);

  useEffect(() => {
    if (!user) navigate("/auth?mode=login");
  }, [user, navigate]);

  if (!user) return null;

  // --------------------------
  // Helpers
  // --------------------------

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePlatformToggle = (platformId: string) =>
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------
  // AI PRICE PREDICTION
  // --------------------------
  const handleAIPredict = async () => {
    if (
      !formData.brand ||
      !formData.model ||
      !formData.year ||
      !formData.mileage ||
      !formData.condition
    ) {
      return toast({
        title: "Missing info",
        description: "Fill all car fields first.",
        variant: "destructive",
      });
    }

    try {
      setAiLoading(true);

      const result = await predictCarPrice({
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        condition: formData.condition,
      });

      setAiResult(result);

      setFormData((prev) => ({
        ...prev,
        price: String(result.recommendedPrice),
      }));

      toast({
        title: "AI Prediction Ready",
        description: "Price has been recommended automatically.",
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Could not estimate price.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // --------------------------
  // FACEBOOK IMPORT
  // --------------------------
  const handleImportFromFacebook = async () => {
    if (!fbUrl.trim()) {
      return toast({
        title: "Missing URL",
        description: "Paste Facebook car link first.",
      });
    }

    setIsImportingFb(true);

    try {
      const res = await axios.post<FacebookScrapeResult>(FB_SCRAPE_URL, {
        url: fbUrl.trim(),
      });

      const data = res.data;

      setFormData((prev) => ({
        ...prev,
        brand: data.brand ?? prev.brand,
        model: data.model ?? prev.model,
        year: data.year ? String(data.year) : prev.year,
        price: data.price ? String(data.price) : prev.price,
        mileage: data.mileage ? String(data.mileage) : prev.mileage,
        condition:
          data.condition === "new" ||
          data.condition === "used" ||
          data.condition === "certified"
            ? data.condition
            : prev.condition,
        description: data.description ?? prev.description,
        platforms:
          data.platforms && data.platforms.length > 0
            ? data.platforms
            : prev.platforms.includes("facebook")
            ? prev.platforms
            : [...prev.platforms, "facebook"],
      }));

      if (data.images?.length) {
        setSelectedImages((prev) => [
          ...data.images!,
          ...prev.filter((i) => !data.images!.includes(i)),
        ]);
      }

      toast({
        title: "Imported",
        description: "Fields have been auto-filled.",
      });
    } catch {
      toast({
        title: "Import failed",
        description: "Could not scrape this listing.",
        variant: "destructive",
      });
    } finally {
      setIsImportingFb(false);
    }
  };

  // --------------------------
  // SUBMIT
  // --------------------------
  const handleSubmit = async () => {
    if (!formData.description || formData.platforms.length === 0) {
      return toast({
        title: "Missing data",
        description: "Fill all required fields.",
        variant: "destructive",
      });
    }

    if (selectedFiles.length === 0) {
      return toast({
        title: "Missing images",
        description: "Upload at least one real image.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "platforms") {
          formData.platforms.forEach((p) => fd.append("platforms", p));
        } else {
          fd.append(key, value as string);
        }
      });

      selectedFiles.forEach((file) => fd.append("images", file));

      await createCar(fd, user.token);

      toast({ title: "Car Listed!" });
      navigate("/profile");
    } catch {
      toast({
        title: "Error",
        description: "Could not list your car.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // --------------------------
  // UI (MOBILE OPTIMIZED)
  // --------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-6">
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mx-auto max-w-xl">
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Sell Your Car</h1>
            <p className="text-xs mt-1 text-muted-foreground">Step {step} of 3</p>
          </div>

          {/* Steps bar */}
          <div className="mb-6 flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Card */}
          <Card className="shadow-sm border rounded-xl">
            {/* ---------------- STEP 1 ---------------- */}
            {step === 1 && (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Car Details</CardTitle>
                  <CardDescription className="text-xs">
                    Tell us about your car
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                  
                  {/* Facebook import */}
                  <div className="rounded-lg border p-3 space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <Link2 className="h-4 w-4" />
                      Import from Facebook (optional)
                    </Label>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={fbUrl}
                        onChange={(e) => setFbUrl(e.target.value)}
                        placeholder="Paste car link..."
                        className="text-sm"
                      />

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleImportFromFacebook}
                        disabled={isImportingFb}
                        className="gap-1"
                      >
                        {isImportingFb ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Import"
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Auto-fills brand, year, mileage, description & images.
                    </p>
                  </div>

                  {/* BRAND / MODEL */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Brand *</Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        placeholder="e.g., Toyota"
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Model *</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        placeholder="e.g., Camry"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* YEAR / CONDITION */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Year *</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                        placeholder="2020"
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Condition *</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) =>
                          handleInputChange("condition", value)
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="certified">
                            Certified Pre-Owned
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    size="sm"
                    className="w-full text-sm"
                  >
                    Continue
                  </Button>
                </CardContent>
              </>
            )}

            {/* ---------------- STEP 2 ---------------- */}
            {step === 2 && (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pricing</CardTitle>
                  <CardDescription className="text-xs">
                    Set your price and mileage
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Mileage (mi) *</Label>
                      <Input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) =>
                          handleInputChange("mileage", e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAIPredict}
                    disabled={aiLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-sm"
                  >
                    {aiLoading ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Predicting...
                      </div>
                    ) : (
                      "AI Predict Price"
                    )}
                  </Button>

                  {aiResult && (
                    <div className="mt-3 p-3 rounded-lg border bg-muted/20 text-sm">
                      <h3 className="font-semibold text-base">
                        AI Price Estimate
                      </h3>
                      <p><strong>Min:</strong> ${aiResult.minPrice}</p>
                      <p><strong>Max:</strong> ${aiResult.maxPrice}</p>
                      <p>
                        <strong>Recommended:</strong> $
                        {aiResult.recommendedPrice}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {aiResult.marketSummary}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full text-sm"
                    >
                      Back
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setStep(3)}
                      className="w-full text-sm"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* ---------------- STEP 3 ---------------- */}
            {step === 3 && (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Description & Images</CardTitle>
                  <CardDescription className="text-xs">
                    Add details & upload photos
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 text-sm">
                  
                  {/* Description */}
                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      rows={3}
                      className="text-sm"
                      placeholder="Describe your car..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                  </div>

                  {/* Platforms */}
                  <div>
                    <Label>List on Platforms *</Label>
                    <div className="rounded-lg border p-3 space-y-2">
                      {platforms.map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.platforms.includes(p.id)}
                            onCheckedChange={() => handlePlatformToggle(p.id)}
                          />
                          <span className="text-sm">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <Label>Upload Images *</Label>

                    <label
                      htmlFor="image-upload"
                      className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center hover:border-primary"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-xs">Click to upload</p>
                    </label>

                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />

                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                        {selectedImages.map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img}
                              className="h-20 w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute -top-1 -right-1 bg-red-600 text-white h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-full text-sm"
                    >
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full text-sm"
                    >
                      {isSubmitting ? "Listing..." : "List Car"}
                    </Button>
                  </div>

                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellCar;
