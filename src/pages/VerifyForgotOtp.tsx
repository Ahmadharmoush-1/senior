import { useState } from "react";
import { verifyForgotOtp } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyForgotOtp = () => {
  const [search] = useSearchParams();
  const email = search.get("email") || "";
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verifyForgotOtp(email, otp);

      toast({ title: "OTP verified!" });

      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast({
        title: "Invalid OTP",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Enter OTP</h1>

        <Input
          className="h-8 text-sm"
          maxLength={6}
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          required
        />

        <Button className="w-full h-9 text-sm">Verify</Button>
      </form>
    </div>
  );
};

export default VerifyForgotOtp;
