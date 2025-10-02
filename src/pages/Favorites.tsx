import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { mockCars } from "@/lib/mockData";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useEffect } from "react";

const Favorites = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth?mode=login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const favoriteCars = mockCars.filter((car) => favorites.includes(car.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {favoriteCars.length} {favoriteCars.length === 1 ? "car" : "cars"} saved
          </p>
        </div>

        {favoriteCars.length === 0 ? (
          <Card className="py-20">
            <CardContent className="text-center">
              <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Favorites Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start browsing cars and save your favorites to view them here.
              </p>
              <Button variant="default" onClick={() => navigate("/")}>
                Browse Cars
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favoriteCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
