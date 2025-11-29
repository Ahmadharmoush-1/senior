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

  const { requestOtpLogin, verifyOtpLogin, register, user, isLoading } = useAuth();
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

    try {
      if (!email.includes("@")) {
        toast({ title: "Invalid email", description: "Enter a valid email.", variant: "destructive" });
        return;
      }

      if (!isLogin) {
        const v = passwordSchema.safeParse(password);
        if (!v.success) {
          toast({ title: "Weak password", description: v.error.issues[0].message, variant: "destructive" });
          return;
        }

        if (password !== confirmPassword) {
          toast({ title: "Passwords don't match", description: "Check confirm password.", variant: "destructive" });
          return;
        }

        if (!name.trim()) {
          toast({ title: "Name required", description: "Enter your full name.", variant: "destructive" });
          return;
        }

        await register(name, email, password);
        toast({ title: "Account created!", description: "Welcome to CarFinder Hub." });
        navigate("/");
        return;
      }

      // LOGIN FLOW
      if (!otpStep) {
        await requestOtpLogin(email, password);
        toast({
          title: "OTP sent!",
          description: "Check your email for the 6-digit code.",
        });
        setOtpStep(true);
        return;
      }

      // OTP STEP
      if (otp.length !== 6) {
        toast({
          title: "Invalid OTP",
          description: "OTP must be 6 digits.",
          variant: "destructive",
        });
        return;
      }

      await verifyOtpLogin(email, otp);
      toast({ title: "Welcome back!", description: "Logged in successfully." });
      navigate("/");
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    }
  };

  const passwordsMatch = !isLogin && password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = !isLogin && password && confirmPassword && password !== confirmPassword;

  return (
    <div className="flex min-h-screen">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-10" />
        <img src={authHero} alt="CarFinder Hub" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative z-20 flex flex-col justify-center px-12 text-white">
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Car className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold">CarFinder Hub</h1>
            </div>
            <p className="text-xl font-medium">Find and list cars across platforms – all in one hub.</p>
            <p className="text-lg text-white/90">
              Connect with buyers and sellers on Edmunds, OLX, Facebook Marketplace, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex w-full items-center justify-center bg-background p-4 lg:w-1/2">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">CarFinder Hub</h1>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin
                ? otpStep
                  ? "Enter the OTP sent to your email"
                  : "Enter your credentials to access your account"
                : "Sign up to start finding your perfect car"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* PASSWORD STEP */}
            {isLogin && !otpStep && (
              <div className="space-y-2">
                <Label htmlFor="password"></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-smooth"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP STEP */}
            {isLogin && otpStep && (
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    await requestOtpLogin(email, password);
                    toast({ title: "OTP resent!", description: "Check your email." });
                  }}
                  className="text-sm text-primary hover:underline transition-smooth"
                >
                  Resend OTP
                </button>
              </div>
            )}

            {/* SIGNUP PASSWORDS */}
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password"></Label>
                  <PasswordInput id="password" value={password} onChange={setPassword} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                      className={`pr-10 transition-smooth ${
                        passwordsMatch ? "border-green-500" : passwordsDontMatch ? "border-destructive" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordsMatch && <p className="text-xs text-green-600">Passwords match ✓</p>}
                  {passwordsDontMatch && <p className="text-xs text-destructive">Passwords don't match</p>}
                </div>
              </>
            )}

            {isLogin && !otpStep && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                  <label htmlFor="remember" className="text-sm font-medium leading-none">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-sm text-primary hover:underline transition-smooth">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" variant="default" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Please wait...
                </span>
              ) : isLogin ? (otpStep ? "Verify OTP" : "Sign In") : "Create Account"}
            </Button>

            {!otpStep && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <SocialLoginButtons />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span className="font-semibold text-primary">{isLogin ? "Sign up" : "Sign in"}</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
