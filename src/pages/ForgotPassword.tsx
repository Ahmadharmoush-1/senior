import { useState } from "react";
import { forgotPassword } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword(email);
      toast({ title: "OTP sent!", description: "Check your email." });

      navigate(`/verify-forgot-otp?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast({
        title: "Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Reset your password</h1>

        <Input
          className="h-8 text-sm"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button className="w-full h-9 text-sm">Send OTP</Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
