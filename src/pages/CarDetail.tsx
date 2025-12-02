// src/pages/CarDetail.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllCars, getCarById, deleteCar } from "@/api/cars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Gauge,
  Calendar,
  Mail,
  Phone,
  Heart,
  GitCompare,
  Edit,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ImageCarousel from "@/components/ImageCarousel";
import CarCard from "@/components/CarCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Car as CarType } from "@/types/car";
import { mapApiCarToCar } from "@/utils/mapApiCarToCar";

function getAxiosMessage(err: unknown, fallback = "Something went wrong.") {
  if (err && typeof err === "object" && "response" in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? fallback;
  }
  return fallback;
}

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInComparison, addToComparison, removeFromComparison } =
    useComparison();

  const [car, setCar] = useState<CarType | null>(null);
  const [similarCars, setSimilarCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = !!user && car?.seller.id === user._id;

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const apiCar = await getCarById(id);
        setCar(mapApiCarToCar(apiCar));

        const allCars = await getAllCars();
        setSimilarCars(allCars.map(mapApiCarToCar));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleDelete = async () => {
    if (!user || !car) return;
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await deleteCar(car.id, user.token);
      toast({ title: "Car deleted successfully" });
      navigate("/profile");
    } catch (err: unknown) {
      toast({
        title: "Error deleting car",
        description: getAxiosMessage(err),
        variant: "destructive",
      });
    }
  };

  const buildWhatsAppLink = (phoneRaw: string, car: CarType) => {
    const digits = phoneRaw.replace(/\D/g, "");
    if (!digits) return "#";

    const text = `Hi ${car.seller.name}, I'm interested in your ${car.title} listed for $${car.price.toLocaleString()}. Is it still available?`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-20 text-center">
        <h1 className="text-xl font-bold">Loading car details...</h1>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-3 py-20 text-center">
        <h1 className="text-xl font-bold">Car Not Found</h1>
        <Button size="sm" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4 gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {isOwner && (
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              onClick={() => navigate(`/edit-car/${car.id}`)}
              className="gap-1 text-sm"
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="gap-1 text-sm"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}

        {/* SAVE + COMPARE */}
        <div className="mb-4 flex gap-2">
          <Button
            size="sm"
            variant={isFavorite(car.id) ? "default" : "outline"}
            onClick={() => {
              toggleFavorite(car.id);
              toast({
                title: isFavorite(car.id)
                  ? "Removed from favorites"
                  : "Added to favorites",
              });
            }}
            className="gap-2 text-xs"
          >
            <Heart className="h-4 w-4" />
            {isFavorite(car.id) ? "Saved" : "Save"}
          </Button>

          <Button
            size="sm"
            variant={isInComparison(car.id) ? "default" : "outline"}
            onClick={() => {
              if (isInComparison(car.id)) {
                removeFromComparison(car.id);
                toast({ title: "Removed from comparison" });
              } else {
                addToComparison(car);
              }
            }}
            className="gap-2 text-xs"
          >
            <GitCompare className="h-4 w-4" />
            {isInComparison(car.id) ? "In Comparison" : "Compare"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <ImageCarousel images={car.images} alt={car.title} />
            </Card>

            <Card>
              <CardHeader>
  <div className="flex justify-between items-start">
    <div>
      <CardTitle className="text-xl">{car.title}</CardTitle>

      <p className="mt-1 text-lg font-bold text-primary">
        ${car.price.toLocaleString()}
      </p>

      {/* ⭐ NEW: PHONE + WHATSAPP BUTTONS HERE */}
      {car.seller.phone && (
        <div className="flex gap-2 mt-2">
          {/* CALL BUTTON */}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <a href={`tel:${car.seller.phone}`}>
              <Phone className="h-4 w-4" />
              {car.seller.phone}
            </a>
          </Button>

          {/* WHATSAPP BUTTON */}
          <Button
            asChild
            size="sm"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <a
              href={`https://wa.me/${car.seller.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hi, I'm interested in your ${car.title} listed for $${car.price.toLocaleString()}.`
              )}`}
              target="_blank"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                viewBox="0 0 32 32"
                width="18"
              >
                <path
                  fill="white"
                  d="M16.04 6.005c-5.52 0-10 4.48-10 10 0 1.76.47 3.48 1.37 5.02l-1.45 5.32 5.46-1.42c1.48.8 3.15 1.22 4.64 1.22h.01c5.52 0 10-4.48 10-10s-4.49-10.14-10.03-10.14zm5.88 14.34c-.25.7-1.47 1.35-2.05 1.43-.53.08-1.21.11-1.95-.12-.45-.14-1.03-.33-1.77-.65-3.12-1.34-5.15-4.46-5.31-4.67-.15-.21-1.27-1.7-1.27-3.25 0-1.55.79-2.32 1.07-2.63.28-.31.62-.39.83-.39.21 0 .41 0 .59.01.19.01.44-.07.69.53.25.6.85 2.07.92 2.22.07.15.11.32.02.52-.08.2-.13.33-.25.51-.13.18-.27.4-.39.54-.13.14-.27.3-.12.59.14.29.63 1.04 1.36 1.68.94.84 1.74 1.1 2.03 1.22.29.12.46.1.63-.06.17-.17.73-.85.93-1.14.21-.29.42-.24.69-.14.28.1 1.76.83 2.06.98.3.15.5.23.57.36.08.14.08.81-.17 1.51z"
                />
              </svg>
              WhatsApp
            </a>
          </Button>
        </div>
      )}
      {/* END NEW SECTION */}
    </div>

    <Badge
      variant={car.condition === "new" ? "default" : "outline"}
      className="capitalize text-xs px-2 py-1"
    >
      {car.condition}
    </Badge>
  </div>
</CardHeader>


              <CardContent className="space-y-4 text-sm">
                {/* YEAR + MILEAGE */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="text-xs">Year</p>
                      <p className="font-semibold">{car.year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-4 w-4" />
                    <div>
                      <p className="text-xs">Mileage</p>
                      <p className="font-semibold">
                        {car.mileage.toLocaleString()} mi
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* DESCRIPTION */}
                <div>
                  <h3 className="font-semibold text-base mb-2">Description</h3>
                  <p className="text-muted-foreground text-sm">
                    {car.description}
                  </p>
                </div>

                <Separator />

                {/* SPECIFICATIONS */}
                <div>
                  <h3 className="font-semibold text-base mb-2">
                    Specifications
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {car.fuelType && (
                      <p>
                        <strong>Fuel:</strong> {car.fuelType}
                      </p>
                    )}
                    {car.transmission && (
                      <p>
                        <strong>Transmission:</strong> {car.transmission}
                      </p>
                    )}
                    {car.color && (
                      <p>
                        <strong>Color:</strong> {car.color}
                      </p>
                    )}
                    {car.engineSize && (
                      <p>
                        <strong>Engine Size:</strong> {car.engineSize}
                      </p>
                    )}
                    {car.doors !== undefined && (
                      <p>
                        <strong>Doors:</strong> {car.doors}
                      </p>
                    )}
                    {car.cylinders !== undefined && (
                      <p>
                        <strong>Cylinders:</strong> {car.cylinders}
                      </p>
                    )}
                    {car.drivetrain && (
                      <p>
                        <strong>Drivetrain:</strong> {car.drivetrain}
                      </p>
                    )}
                    {car.bodyType && (
                      <p>
                        <strong>Body Type:</strong> {car.bodyType}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* LISTED ON */}
                <div>
                  <h3 className="font-semibold text-base mb-2">Listed On</h3>
                  <div className="flex flex-wrap gap-1">
                    {car.platform.map((p, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                      >
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: SELLER */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-base">
                  Seller Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {car.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{car.seller.name}</p>
                  </div>
                </div>

                <Separator />

                <a
                  href={`mailto:${car.seller.email}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" /> {car.seller.email}
                </a>

                {car.seller.phone && (
                  <a
                    href={`tel:${car.seller.phone}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" /> {car.seller.phone}
                  </a>
                )}

                <Separator />

                {car.seller.phone && (
                  <div className="space-y-2">
                    <Button asChild size="sm" className="w-full text-sm">
                      <a href={`tel:${car.seller.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    </Button>

                    <Button
                      asChild
                      size="sm"
                      className="w-full text-sm"
                    >
                      <a
                        href={buildWhatsAppLink(car.seller.phone, car)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                )}

                {!car.seller.phone && (
                  <p className="text-xs text-muted-foreground">
                    No phone number provided for this listing.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SIMILAR CARS */}
        {similarCars.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Similar Cars</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarCars.map((c) => (
                <CarCard key={c.id} car={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CarDetail;
