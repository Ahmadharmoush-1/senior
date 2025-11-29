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

const platforms = [
  { id: "edmunds", name: "Edmunds" },
  { id: "olx", name: "OLX" },
  { id: "facebook", name: "Facebook Marketplace" },
  { id: "autotrader", name: "AutoTrader" },
  { id: "cars", name: "Cars.com" },
];

// ✅ CHANGE THIS if your backend route is different
const FB_SCRAPE_URL = "http://127.0.0.1:5000/api/scrape/facebook";

// Expected response shape from backend scraper
type FacebookScrapeResult = Partial<{
  brand: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage: number | string;
  condition: "new" | "used" | "certified" | string;
  description: string;
  // images as URLs from Facebook
  images: string[];
  // optional platforms array from scraper
  platforms: string[];
}>;

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

  // ✅ Facebook import state
  const [fbUrl, setFbUrl] = useState("");
  const [isImportingFb, setIsImportingFb] = useState(false);

  useEffect(() => {
    if (!user) navigate("/auth?mode=login");
  }, [user, navigate]);

  if (!user) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

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

  const handleNext = () => {
    if (step === 1) {
      if (
        !formData.brand ||
        !formData.model ||
        !formData.year ||
        !formData.condition
      ) {
        return toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
    }

    if (step === 2) {
      if (!formData.price || !formData.mileage) {
        return toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
      }
    }

    setStep((prev) => prev + 1);
  };

  // ✅ Import from Facebook Marketplace
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
        year:
          data.year !== undefined && data.year !== null
            ? String(data.year)
            : prev.year,
        price:
          data.price !== undefined && data.price !== null
            ? String(data.price)
            : prev.price,
        mileage:
          data.mileage !== undefined && data.mileage !== null
            ? String(data.mileage)
            : prev.mileage,
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

      // show imported image URLs as previews
      if (data.images?.length) {
        setSelectedImages((prevImgs) => [
          ...data.images!,
          ...prevImgs.filter((x) => !data.images!.includes(x)),
        ]);

        toast({
          title: "Facebook images imported",
          description:
            "Images were added as previews. Please upload at least one real image before listing.",
        });
      }

      toast({
        title: "Imported from Facebook",
        description: "Fields auto-filled successfully.",
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message || "Failed to import Facebook listing."
          : "Failed to import Facebook listing.";

      toast({
        title: "Import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsImportingFb(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.description || formData.platforms.length === 0) {
      return toast({
        title: "Missing information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
    }

    // still require real files because backend expects multipart images
    if (selectedFiles.length === 0) {
      return toast({
        title: "Missing images",
        description:
          "Please upload at least one real image (Facebook previews don't count).",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("brand", formData.brand);
      fd.append("model", formData.model);
      fd.append("year", formData.year);
      fd.append("mileage", formData.mileage);
      fd.append("price", formData.price);
      fd.append("condition", formData.condition);
      fd.append("description", formData.description);

      formData.platforms.forEach((p) => fd.append("platforms", p));
      selectedFiles.forEach((file) => fd.append("images", file));

      await createCar(fd, user.token);

      toast({
        title: "Success!",
        description: "Your car has been listed successfully.",
      });

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
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
            {/* Step 1 */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Car Details</CardTitle>
                  <CardDescription>Tell us about your car</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* ✅ Facebook Import Box */}
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
                      This will auto-fill brand, model, year, price, mileage,
                      description, platforms, and preview images if available.
                    </p>
                  </div>

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

                  <Button onClick={handleNext} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </>
            )}

            {/* Step 2 — Pricing */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Set your price and mileage</CardDescription>
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

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full"
                    >
                      Back
                    </Button>
                    <Button onClick={handleNext} className="w-full">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Description & Platforms</CardTitle>
                  <CardDescription>
                    Add details and where to list
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
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
