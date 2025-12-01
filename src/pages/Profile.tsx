// src/pages/Profile.tsx (MOBILE OPTIMIZED)
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
      title: "Coming Soon",
      description: "Profile picture upload is not connected yet.",
    });
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated.",
    });
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth?mode=login");
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Delete this listing?")) return;

    try {
      await deleteCar(carId, user.token);
      toast({ title: "Car deleted" });
      fetchUserCars();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: getAxiosMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 py-6 animate-fade-in">
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* LEFT PANEL — PROFILE */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Profile</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* AVATAR */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-3">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <button
                      onClick={handleProfilePictureUpload}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* NAME + EMAIL */}
                  {isEditingProfile ? (
                    <div className="w-full space-y-3">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={profileEmail}
                          type="email"
                          onChange={(e) => setProfileEmail(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleSaveProfile}>
                          Save
                        </Button>
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {/* STATS */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span>Oct 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Listings</span>
                    <span>{userCars.length}</span>
                  </div>
                </div>

                <Separator />

                {!isEditingProfile && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL — MY CARS */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">My Listings</CardTitle>
                  <Button onClick={() => navigate("/sell")} className="h-8 px-3 text-sm">
                    Add Listing
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {loadingCars ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : userCars.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground text-sm">
                      You have no listings yet.
                    </p>
                    <Button className="mt-3" onClick={() => navigate("/sell")}>
                      List Your First Car
                    </Button>
                  </div>
                ) : (
                  userCars.map((car) => (
                    <Card key={car.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row gap-3 p-3">
                        {/* IMAGE */}
                        <div className="w-full sm:w-40 aspect-video rounded-md overflow-hidden bg-muted">
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* INFO */}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-semibold">{car.title}</h3>
                              <p className="text-xl font-semibold text-primary">
                                ${car.price.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize text-xs">
                              {car.condition}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground text-xs line-clamp-2">
                            {car.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {car.platform.map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-2">
                                {p.name}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/edit-car/${car.id}`)}
                              className="h-7 px-2 text-xs"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCar(car.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
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
