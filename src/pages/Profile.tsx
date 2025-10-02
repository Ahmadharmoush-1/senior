import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockCars } from "@/lib/mockData";
import { Mail, Edit, Trash2 } from "lucide-react";
import { useEffect } from "react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth?mode=login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Mock user's listed cars (in real app, filter by user ID)
  const userCars = mockCars.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">Oct 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Listings</span>
                    <span className="font-medium">{userCars.length}</span>
                  </div>
                </div>

                <Separator />

                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User's Cars */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Listings</CardTitle>
                  <Button variant="default" onClick={() => navigate("/sell")}>
                    Add New Listing
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {userCars.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">You haven't listed any cars yet.</p>
                    <Button
                      variant="default"
                      className="mt-4"
                      onClick={() => navigate("/sell")}
                    >
                      List Your First Car
                    </Button>
                  </div>
                ) : (
                  userCars.map((car) => (
                    <Card key={car.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        <div className="w-full md:w-48 aspect-video overflow-hidden rounded-lg bg-muted">
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{car.title}</h3>
                              <p className="text-2xl font-bold text-primary">
                                ${car.price.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {car.condition}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {car.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {car.platform.map((platform, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {platform.name}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="gap-2">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
