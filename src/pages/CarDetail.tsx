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
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Loading car details...</h1>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Car Not Found</h1>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Button>

        {/* ✅ OWNER ACTIONS */}
        {isOwner && (
          <div className="flex gap-2 mb-4">
            <Button onClick={() => navigate(`/edit-car/${car.id}`)} className="gap-2">
              <Edit className="h-4 w-4" /> Edit Listing
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete Listing
            </Button>
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <Button
            variant={isFavorite(car.id) ? "default" : "outline"}
            onClick={() => {
              toggleFavorite(car.id);
              toast({
                title: isFavorite(car.id)
                  ? "Removed from favorites"
                  : "Added to favorites",
              });
            }}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${isFavorite(car.id) ? "fill-current" : ""}`} />
            {isFavorite(car.id) ? "Saved" : "Save"}
          </Button>

          <Button
            variant={isInComparison(car.id) ? "default" : "outline"}
            onClick={() => {
              if (isInComparison(car.id)) {
                removeFromComparison(car.id);
                toast({ title: "Removed from comparison" });
              } else {
                const added = addToComparison(car);
                toast({
                  title: added ? "Added to comparison" : "Comparison limit reached",
                });
              }
            }}
            className="gap-2"
          >
            <GitCompare className="h-4 w-4" />
            {isInComparison(car.id) ? "In Comparison" : "Compare"}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <ImageCarousel images={car.images} alt={car.title} />
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{car.title}</CardTitle>
                    <p className="mt-2 text-2xl font-bold text-primary">
                      ${car.price.toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={car.condition === "new" ? "default" : "outline"}
                    className="capitalize text-base px-4 py-1"
                  >
                    {car.condition}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="text-xs">Year</p>
                      <p className="font-semibold">{car.year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-5 w-5" />
                    <div>
                      <p className="text-xs">Mileage</p>
                      <p className="font-semibold">{car.mileage.toLocaleString()} mi</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-muted-foreground">{car.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">Listed On</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.platform.map((p, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1">
                        {p.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {car.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{car.seller.name}</p>
                    <p className="text-sm text-muted-foreground">Private Seller</p>
                  </div>
                </div>

                <Separator />

                <a
                  href={`mailto:${car.seller.email}`}
                  className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
                >
                  <Mail className="h-4 w-4" /> {car.seller.email}
                </a>

                <a
                  href={`tel:${car.seller.phone}`}
                  className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
                >
                  <Phone className="h-4 w-4" /> {car.seller.phone || "N/A"}
                </a>

                <Separator />

                <Button className="w-full">Contact Seller</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {similarCars.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Cars You May Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
