import { Link } from "react-router-dom";
import { Car as CarType } from "@/types/car";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Gauge, Heart, GitCompare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "@/hooks/use-toast";

interface CarCardProps {
  car: CarType;
}

const CarCard = ({ car }: CarCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(car.id);
    toast({
      title: isFavorite(car.id) ? "Removed from favorites" : "Added to favorites",
    });
  };

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault();
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

  return (
    <Link to={`/car/${car.id}`}>
      <Card className="group overflow-hidden transition-smooth hover:shadow-card-hover">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={car.images[0]}
            alt={car.title}
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
          <div className="absolute right-2 top-2 flex flex-wrap gap-1">
            {car.platform.map((platform, index) => (
              <Badge key={index} variant="secondary" className="bg-card/90 backdrop-blur-sm">
                {platform.name}
              </Badge>
            ))}
          </div>
          <div className="absolute left-2 top-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 backdrop-blur-sm hover:bg-card"
              onClick={handleFavoriteClick}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite(car.id) ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-card/90 backdrop-blur-sm hover:bg-card"
              onClick={handleComparisonClick}
            >
              <GitCompare
                className={`h-4 w-4 ${isInComparison(car.id) ? "text-primary" : ""}`}
              />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-1">{car.title}</h3>
          
          <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{car.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              <span>{car.mileage.toLocaleString()} mi</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-primary">${car.price.toLocaleString()}</p>
            <Badge variant={car.condition === "new" ? "default" : "outline"} className="capitalize">
              {car.condition}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CarCard;