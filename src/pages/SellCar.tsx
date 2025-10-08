import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import MapPicker from "@/components/MapPicker";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, MapPin, X } from "lucide-react";

const platforms = [
  { id: "edmunds", name: "Edmunds" },
  { id: "olx", name: "OLX" },
  { id: "facebook", name: "Facebook Marketplace" },
  { id: "autotrader", name: "AutoTrader" },
  { id: "cars", name: "Cars.com" },
];

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
    location: "",
    latitude: 0,
    longitude: 0,
    platforms: [] as string[],
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth?mode=login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

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

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...newImages]);
      toast({
        title: "Images added",
        description: `${files.length} image(s) ready for upload.`,
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.brand || !formData.model || !formData.year || !formData.condition) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.mileage || !formData.price || !formData.location) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!formData.description || formData.platforms.length === 0) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast({
      title: "Success!",
      description: "Your car has been listed successfully.",
    });
    
    setIsSubmitting(false);
    navigate("/profile");
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
            <p className="mt-2 text-muted-foreground">
              Step {step} of 3
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-smooth ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Card className="shadow-card">
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Car Details</CardTitle>
                  <CardDescription>
                    Tell us about your car
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        placeholder="e.g., Toyota"
                        value={formData.brand}
                        onChange={(e) => handleInputChange("brand", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        placeholder="e.g., Camry"
                        value={formData.model}
                        onChange={(e) => handleInputChange("model", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        placeholder="2020"
                        value={formData.year}
                        onChange={(e) => handleInputChange("year", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition *</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => handleInputChange("condition", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="certified">Certified Pre-Owned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button variant="default" onClick={handleNext} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Pricing & Location</CardTitle>
                  <CardDescription>
                    Set your price and location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="25000"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage (miles) *</Label>
                      <Input
                        id="mileage"
                        type="number"
                        placeholder="50000"
                        value={formData.mileage}
                        onChange={(e) => handleInputChange("mileage", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Pick Location on Map *
                    </Label>
                    <MapPicker
                      onLocationSelect={handleLocationSelect}
                      initialLat={formData.latitude || 37.7749}
                      initialLng={formData.longitude || -122.4194}
                    />
                    {formData.location && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {formData.location}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                      Back
                    </Button>
                    <Button variant="default" onClick={handleNext} className="w-full">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Description & Platforms</CardTitle>
                  <CardDescription>
                    Add details and choose where to list
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your car's features, condition, and history..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>List on Platforms *</Label>
                    <div className="space-y-3 rounded-lg border p-4">
                      {platforms.map((platform) => (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={formData.platforms.includes(platform.id)}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                          />
                          <label
                            htmlFor={platform.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {platform.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select at least one platform to list your car
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Upload Images</Label>
                    <div className="space-y-3">
                      <label
                        htmlFor="image-upload"
                        className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-smooth hover:border-primary hover:bg-primary/5"
                      >
                        <div>
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">
                            Click to upload car images
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload up to 10 images (JPG, PNG)
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
                            <div key={index} className="relative group animate-scale-in">
                              <img
                                src={img}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-full rounded-lg object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-smooth"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                      Back
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSubmit}
                      className="w-full"
                      disabled={isSubmitting}
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
