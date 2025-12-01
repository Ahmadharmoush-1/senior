import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";

import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";

import Dashboard from "./pages/Dashboard";
import CarDetail from "./pages/CarDetail";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SellCar from "./pages/SellCar";
import Compare from "./pages/Compare";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import EditCar from "./pages/EditCar";

/* ⭐ IMPORT CHATBOT ⭐ */
import { ChatBot } from "@/components/ui/ChatBot";
// import AIChat from "./pages/AIChat";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("splashShown");
  });

  useEffect(() => {
    if (!showSplash) {
      sessionStorage.setItem("splashShown", "true");
    }
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem("splashShown", "true");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ComparisonProvider>
                <Toaster />
                <Sonner />

                {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

                <BrowserRouter>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/car/:id" element={<CarDetail />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/sell" element={<SellCar />} />
                    <Route path="/edit-car/:id" element={<EditCar />} />
                    <Route path="/compare" element={<Compare />} />
                    {/* <Route path="/ai" element={<AIChat />} /> */}

                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>

                {/* ⭐ AI CHATBOT FLOATING BUTTON ⭐ */}
                <ChatBot />

              </ComparisonProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
