import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show welcome text after logo animation starts
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete splash screen after fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8 px-4">
        {/* Logo with zoom-in and fade-in animation */}
        <div className="animate-[scale-in_0.8s_ease-out]">
          <img
  src="/photos/logo.png"
  alt="CarFinder Hub Logo"
  className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-full border border-gray-300 shadow-md"
/>

        </div>

        {/* Welcome text with fade-in animation */}
        <div
          className={`text-center transition-all duration-700 ${
            showText
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to CarFinder Hub
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Find your perfect car across multiple platforms
          </p>
        </div>

        {/* Loading indicator */}
        <div
          className={`transition-opacity duration-500 ${
            showText ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]" />
            <div className="w-2 h-2 bg-accent rounded-full animate-[bounce_1s_infinite_400ms]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;