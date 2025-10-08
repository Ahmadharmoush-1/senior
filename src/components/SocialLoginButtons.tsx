import { Button } from "@/components/ui/button";
import { Chrome, Facebook } from "lucide-react";

const SocialLoginButtons = () => {
  const handleSocialLogin = (provider: string) => {
    // Placeholder for social login - connect to backend later
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin("google")}
        className="w-full gap-2 transition-smooth hover:border-primary"
      >
        <Chrome className="h-4 w-4" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSocialLogin("facebook")}
        className="w-full gap-2 transition-smooth hover:border-primary"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
