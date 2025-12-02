// src/pages/SellCar.tsx
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

import { ArrowLeft, Upload, X, Link2, Loader2 } from "lucide-react";

import { createCar } from "@/api/cars";
import axios from "axios";
import { predictCarPrice } from "@/services/aiService";

// Platforms used in UI
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

    toast({
      title: "Images added",
      description: `${newFiles.length} image(s) ready for upload.`,
    });
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
        title: "Missing information",
        description:
          "Please fill car details first (brand, model, year, mileage, condition).",
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
        title: "AI Price Estimated",
        description: "A smart price recommendation has been generated.",
      });
    } catch (error) {
      toast({
        title: "AI Error",
        description: "Failed to predict price. Please try again.",
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
        description: "Paste a Facebook Marketplace car link first.",
        variant: "destructive",
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
        setSelectedImages((prevImgs) => [
          ...data.images!,
          ...prevImgs.filter((x) => !data.images!.includes(x)),
        ]);
        toast({
          title: "Facebook images imported",
          description: "Preview images added.",
        });
      }

      toast({
        title: "Imported successfully",
        description: "Fields auto-filled from Facebook.",
      });
    } catch (err) {
      toast({
        title: "Import failed",
        description: "Could not import from Facebook.",
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
    // 🔥 Extra validation so we don't store 0/empty values
    if (
      !formData.brand ||
      !formData.model ||
      !formData.year ||
      !formData.price ||
      !formData.mileage ||
      !formData.condition ||
      !formData.description ||
      formData.platforms.length === 0
    ) {
      return toast({
        title: "Missing information",
        description:
          "Please fill all required fields: brand, model, year, price, mileage, condition, description, platforms.",
        variant: "destructive",
      });
    }

    if (selectedFiles.length === 0) {
      return toast({
        title: "Missing images",
        description: "Please upload at least one real image.",
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

      toast({
        title: "Success!",
        description: "Your car has been listed.",
      });

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  // --------------------------
  // UI
  // --------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Sell Your Car</h1>
            <p className="mt-2 text-muted-foreground">Step {step} of 3</p>
          </div>

          <div className="mb-8 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Card className="shadow-card">
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Car Details</CardTitle>
                  <CardDescription>Tell us about your car</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* FACEBOOK IMPORT */}
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <Label className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Import from Facebook Marketplace (optional)
                    </Label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={fbUrl}
                        onChange={(e) => setFbUrl(e.target.value)}
                        placeholder="Paste Facebook Marketplace car link..."
                      />
                      <Button
                        type="button"
                        onClick={handleImportFromFacebook}
                        disabled={isImportingFb}
                        className="gap-2"
                      >
                        {isImportingFb && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {isImportingFb ? "Importing..." : "Import"}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Auto-fills year, mileage, price, description, and images.
                    </p>
                  </div>

                  {/* BRAND / MODEL */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Brand *</Label>
                      <Input
                        value={formData.brand}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        placeholder="e.g., Toyota"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Model *</Label>
                      <Input
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        placeholder="e.g., Camry"
                      />
                    </div>
                  </div>

                  {/* YEAR / CONDITION */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Year *</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                        placeholder="2020"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Condition *</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) =>
                          handleInputChange("condition", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
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

                  <Button onClick={() => setStep(2)} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>
                    Set your price and mileage
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mileage (miles) *</Label>
                      <Input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) =>
                          handleInputChange("mileage", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAIPredict}
                    disabled={aiLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {aiLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Predicting Price...
                      </div>
                    ) : (
                      "AI Predict Price"
                    )}
                  </Button>

                  {aiResult && (
                    <div className="mt-4 p-4 rounded-lg border bg-muted/40 shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">
                        AI Price Estimate
                      </h3>
                      <p>
                        <strong>Min:</strong> ${aiResult.minPrice}
                      </p>
                      <p>
                        <strong>Max:</strong> ${aiResult.maxPrice}
                      </p>
                      <p>
                        <strong>Recommended:</strong> $
                        {aiResult.recommendedPrice}
                      </p>
                      <p className="mt-2 text-gray-700">
                        <strong>Market Summary:</strong>
                        <br />
                        {aiResult.marketSummary}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full"
                    >
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} className="w-full">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Description & Platforms</CardTitle>
                  <CardDescription>
                    Add details and where to list
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* DESCRIPTION */}
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe your car..."
                    />
                  </div>

                  {/* PLATFORMS */}
                  <div className="space-y-3">
                    <Label>List on Platforms *</Label>
                    <div className="space-y-3 rounded-lg border p-4">
                      {platforms.map((platform) => (
                        <div
                          key={platform.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            checked={formData.platforms.includes(platform.id)}
                            onCheckedChange={() =>
                              handlePlatformToggle(platform.id)
                            }
                          />
                          <label className="text-sm font-medium">
                            {platform.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* IMAGES */}
                  <div className="space-y-3">
                    <Label>Upload Images *</Label>

                    <label
                      htmlFor="image-upload"
                      className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 text-center hover:border-primary hover:bg-primary/5"
                    >
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm">Click to upload car images</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload up to 10 images
                        </p>
                      </div>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              className="h-24 w-full rounded-lg object-cover"
                              alt={`car-${index}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SUBMIT */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="w-full"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full"
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
