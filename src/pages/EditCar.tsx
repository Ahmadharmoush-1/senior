// src/pages/EditCar.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCarById, updateCar } from "@/api/cars";
import { mapApiCarToCar } from "@/utils/mapApiCarToCar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, ArrowLeft, X } from "lucide-react";

const platformsList = [
  { id: "edmunds", name: "Edmunds" },
  { id: "olx", name: "OLX" },
  { id: "facebook", name: "Facebook Marketplace" },
  { id: "autotrader", name: "AutoTrader" },
  { id: "cars", name: "Cars.com" },
];

const EditCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
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

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (!user) navigate("/auth?mode=login");
  }, [user]);

  // Load car data
  useEffect(() => {
    const loadCar = async () => {
      try {
        if (!id) return;

        const apiCar = await getCarById(id);
        const car = mapApiCarToCar(apiCar);

        // Ownership check
        if (car.seller.id !== user?._id) {
          toast({ title: "Unauthorized", description: "This is not your car." });
          return navigate("/");
        }

        setFormData({
          brand: car.brand,
          model: car.model,
          year: String(car.year),
          mileage: String(car.mileage),
          price: String(car.price),
          condition: car.condition,
          description: car.description,
          platforms: car.platform.map((p) => p.name.toLowerCase()),
        });

        setExistingImages(car.images);
      } catch (err) {
        console.error(err);
        toast({ title: "Error loading car", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadCar();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter((p) => p !== id)
        : [...prev.platforms, id],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const added = Array.from(files);
    setNewImages((prev) => [...prev, ...added]);
    const previews = added.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
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
      existingImages.forEach((img) => fd.append("existingImages", img));
      newImages.forEach((file) => fd.append("images", file));

      await updateCar(id!, fd, user!.token);

      toast({ title: "Car updated successfully" });
      navigate("/profile");
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl">Loading car...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Brand + Model */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                  />
                </div>
              </div>

              {/* Year + Mileage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mileage (mi)</Label>
                  <Input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange("mileage", e.target.value)}
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>

              {/* Condition */}
              <div>
                <Label>Condition</Label>
                <select
                  className="w-full rounded-md border p-2"
                  value={formData.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="certified">Certified</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {/* Platforms */}
              <div>
                <Label>Platforms</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  {platformsList.map((p) => (
                    <div className="flex items-center gap-2" key={p.id}>
                      <Checkbox
                        checked={formData.platforms.includes(p.id)}
                        onCheckedChange={() => togglePlatform(p.id)}
                      />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label>Existing Images</Label>

                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-6 w-6 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <Label>Add New Images</Label>

                <label
                  htmlFor="new-images"
                  className="cursor-pointer border-dashed border-2 rounded-lg p-6 flex items-center justify-center hover:bg-muted"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mr-2" />
                  Upload Images
                </label>

                <input
                  id="new-images"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {previewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {previewImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/profile")}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditCar;
