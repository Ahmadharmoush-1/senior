import { useParams, useNavigate } from "react-router-dom";
import { mockCars } from "@/lib/mockData";
import { getSimilarCars } from "@/lib/filterUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Gauge, Calendar, Mail, Phone, Heart, GitCompare, Fuel, Cog } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ImageCarousel from "@/components/ImageCarousel";
import MapDisplay from "@/components/MapDisplay";
import CarCard from "@/components/CarCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "@/hooks/use-toast";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();
  
  const car = mockCars.find((c) => c.id === id);
  const similarCars = car ? getSimilarCars(car, mockCars) : [];

  const handleFavoriteClick = () => {
    if (car) {
      toggleFavorite(car.id);
      toast({
        title: isFavorite(car.id) ? "Removed from favorites" : "Added to favorites",
      });
    }
  };

  const handleComparisonClick = () => {
    if (!car) return;
    if (isInComparison(car.id)) {
      removeFromComparison(car.id);
      toast({ title: "Removed from comparison" });
    } else {
      const added = addToComparison(car);
      if (added) {
        toast({ title: "Added to comparison" });
      } else {
        toast({
          title: "Comparison limit reached",
          description: "You can only compare up to 3 cars at a time.",
          variant: "destructive",
        });
      }
    }
  };

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">Car Not Found</h1>
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
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>

        <div className="mb-6 flex gap-2">
          <Button
            variant={isFavorite(car.id) ? "default" : "outline"}
            onClick={handleFavoriteClick}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${isFavorite(car.id) ? "fill-current" : ""}`} />
            {isFavorite(car.id) ? "Saved" : "Save"}
          </Button>
          <Button
            variant={isInComparison(car.id) ? "default" : "outline"}
            onClick={handleComparisonClick}
            className="gap-2"
          >
            <GitCompare className="h-4 w-4" />
            {isInComparison(car.id) ? "In Comparison" : "Compare"}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="overflow-hidden">
              <ImageCarousel images={car.images} alt={car.title} />
            </Card>

            {/* Car Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{car.title}</CardTitle>
                    <p className="mt-2 text-2xl font-bold text-primary">
                      ${car.price.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={car.condition === "new" ? "default" : "outline"} className="capitalize text-base px-4 py-1">
                    {car.condition}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="text-xs">Year</p>
                      <p className="font-semibold text-foreground">{car.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gauge className="h-5 w-5" />
                    <div>
                      <p className="text-xs">Mileage</p>
                      <p className="font-semibold text-foreground">{car.mileage.toLocaleString()} mi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <div>
                      <p className="text-xs">Location</p>
                      <p className="font-semibold text-foreground line-clamp-1">{car.location}</p>
                    </div>
                  </div>
                  {car.fuelType && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fuel className="h-5 w-5" />
                      <div>
                        <p className="text-xs">Fuel Type</p>
                        <p className="font-semibold text-foreground capitalize">{car.fuelType}</p>
                      </div>
                    </div>
                  )}
                  {car.transmission && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Cog className="h-5 w-5" />
                      <div>
                        <p className="text-xs">Transmission</p>
                        <p className="font-semibold text-foreground capitalize">{car.transmission}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{car.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-lg font-semibold">Listed On</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.platform.map((platform, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {platform.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Seller Info & Map */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {car.seller.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{car.seller.name}</p>
                    <p className="text-sm text-muted-foreground">Private Seller</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <a
                    href={`mailto:${car.seller.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <Mail className="h-4 w-4" />
                    {car.seller.email}
                  </a>
                  <a
                    href={`tel:${car.seller.phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <Phone className="h-4 w-4" />
                    {car.seller.phone}
                  </a>
                </div>

                <Separator />

                <Button variant="default" className="w-full" size="lg">
                  Contact Seller
                </Button>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Car Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapDisplay
                  lat={37.7749 + Math.random() * 0.1}
                  lng={-122.4194 + Math.random() * 0.1}
                  title={car.title}
                />
                <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {car.location}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Similar Cars You May Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarCars.map((similarCar) => (
                <CarCard key={similarCar.id} car={similarCar} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CarDetail;