import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Edit, Trash2, Camera, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { getMyCars, deleteCar } from "@/api/cars";
import { mapApiCarToCar } from "@/utils/mapApiCarToCar";
import type { Car as CarType } from "@/types/car";

function getAxiosMessage(err: unknown, fallback = "Something went wrong.") {
  if (err && typeof err === "object" && "response" in err) {
    const e = err as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? fallback;
  }
  return fallback;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  const [userCars, setUserCars] = useState<CarType[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  const fetchUserCars = async () => {
    if (!user) return;
    setLoadingCars(true);
    try {
      const apiCars = await getMyCars(user.token);
      setUserCars(apiCars.map(mapApiCarToCar));
    } catch (err) {
      toast({
        title: "Failed to load your cars",
        description: getAxiosMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    if (!user) navigate("/auth?mode=login");
    else fetchUserCars();
  }, [user, navigate]);

  if (!user) return null;

  const handleProfilePictureUpload = () => {
    toast({
      title: "Upload feature",
      description: "Profile picture upload will be available once connected to backend.",
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth?mode=login");
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await deleteCar(carId, user.token);
      toast({ title: "Car deleted successfully!" });
      fetchUserCars();
    } catch (err: unknown) {
      toast({
        title: "Error deleting car",
        description: getAxiosMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleProfilePictureUpload}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-smooth"
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </button>
                  </div>

                  {isEditingProfile ? (
                    <div className="w-full space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-left">Full Name</Label>
                        <Input
                          id="profile-name"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email" className="text-left">Email Address</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} variant="default" className="flex-1">
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </>
                  )}
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

                {!isEditingProfile && (
                  <>
                    <Button variant="outline" className="w-full" onClick={() => setIsEditingProfile(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
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
                {loadingCars ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Loading your listings...
                  </div>
                ) : userCars.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">You haven't listed any cars yet.</p>
                    <Button className="mt-4" onClick={() => navigate("/sell")}>
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => navigate(`/edit-car/${car.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleDeleteCar(car.id)}
                            >
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
