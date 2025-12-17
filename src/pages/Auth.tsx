// src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import PasswordInput from "@/components/PasswordInput";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Car, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { passwordSchema } from "@/lib/validation";
import authHero from "@/assets/hero-car.jpg";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [isLogin, setIsLogin] = useState(mode === "login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { requestOtpLogin, verifyOtpLogin, register, user, isLoading } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    setIsLogin(mode === "login");
    setOtpStep(false);
    setOtp("");
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!isLogin) {
        // SIGNUP VALIDATION
        const v = passwordSchema.safeParse(password);
        if (!v.success) {
          toast({
            title: "Weak password",
            description: v.error.issues[0].message,
            variant: "destructive",
          });
          return;
        }

        if (password !== confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Check confirm password.",
            variant: "destructive",
          });
          return;
        }

        if (!name.trim()) {
          toast({
            title: "Name required",
            description: "Enter your full name.",
            variant: "destructive",
          });
          return;
        }

        await register(name, email, password);
        toast({ title: "Account created!", description: "Welcome to CarsPlus!" });
        navigate("/");
        return;
      }

      // LOGIN FLOW
      if (!otpStep) {
        await requestOtpLogin(email, password);
        toast({
          title: "OTP sent!",
          description: "Check your email.",
        });
        setOtpStep(true);
        return;
      }

      if (otp.length !== 6) {
        toast({
          title: "Invalid OTP",
          description: "OTP must be 6 digits.",
          variant: "destructive",
        });
        return;
      }

      await verifyOtpLogin(email, otp);
      toast({ title: "Welcome back!", description: "Login successful." });
      navigate("/");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const passwordsMatch =
    !isLogin && password && confirmPassword && password === confirmPassword;

  const passwordsDontMatch =
    !isLogin && password && confirmPassword && password !== confirmPassword;

  return (
    <div className="flex min-h-screen bg-background">
      {/*  LEFT HERO (hidden on mobile)  */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={authHero}
          alt="CarFinder"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/10" />
        <div className="relative z-20 flex flex-col justify-center px-10 text-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Car className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">CarsPlus Hub</h1>
          </div>
          <p className="text-base leading-tight">
            Find and list cars across multiple platforms — all in one hub.
          </p>
        </div>
      </div>

      {/*  RIGHT FORM (compact mobile)  */}
      <div className="flex w-full items-center justify-center p-4 lg:w-1/2">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 lg:hidden mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold">CarsPlus Hub</h1>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-xs text-muted-foreground leading-tight">
              {isLogin
                ? otpStep
                  ? "Enter the OTP sent to your email"
                  : "Login to your account"
                : "Sign up to continue"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            {!isLogin && (
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input
                  className="h-8 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                className="h-8 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password (login step) */}
            {isLogin && !otpStep && (
              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    className="h-8 text-sm pr-8"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* OTP STEP */}
            {isLogin && otpStep && (
              <div className="space-y-1">
                <Label className="text-xs">OTP Code</Label>
                <Input
                  className="h-8 text-sm"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
              </div>
            )}

            {/* Signup passwords */}
            {!isLogin && (
              <>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={setPassword}
                 
                />

                <div className="space-y-1">
                  <Label className="text-xs">Confirm Password</Label>
                  <Input
                    className={`h-8 text-sm pr-8 ${
                      passwordsMatch
                        ? "border-green-500"
                        : passwordsDontMatch
                        ? "border-destructive"
                        : ""
                    }`}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Remember me */}
            {isLogin && !otpStep && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v as boolean)}
                    className="h-3 w-3"
                  />
                  <span className="text-xs">Remember me</span>
                </div>
                <button
  type="button"
  onClick={() => navigate("/forgot-password")}
  className="text-xs text-primary"
>
  Forgot?
</button>
              </div>
            )}

            {/* SUBMIT BTN */}
            <Button
              type="submit"
              className="w-full h-9 text-sm"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : isLogin
                ? otpStep
                  ? "Verify OTP"
                  : "Sign In"
                : "Create Account"}
            </Button>

            {/* Divider */}
            {!otpStep && (
              <>
                <div className="relative">
                  <span className="absolute inset-0 border-t" />
                  <span className="relative mx-auto bg-background px-2 text-[10px] text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <SocialLoginButtons  />

                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-xs text-muted-foreground"
                >
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <span className="text-primary font-semibold">
                    {isLogin ? "Sign up" : "Sign in"}
                  </span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
