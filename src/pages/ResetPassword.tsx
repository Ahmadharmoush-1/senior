import { useState } from "react";
import { resetPassword } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { passwordSchema } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";

const ResetPassword = () => {
  const [search] = useSearchParams();
  const email = search.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ⭐ ADD THIS — allows us to auto-login
  const { saveUserSession } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const v = passwordSchema.safeParse(password);
    if (!v.success) {
      toast({
        title: "Weak password",
        description: v.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirm) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      // Backend updates password + returns user & token
      const data = await resetPassword(email, password);

      // ⭐ Auto-login immediately
      saveUserSession(data);

      toast({
        title: "Password reset!",
        description: "Logging you in...",
      });

      navigate("/"); // Dashboard

    } catch (error) {
      toast({
        title: "Failed to reset password",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
        <h1 className="text-xl font-semibold">Create New Password</h1>

        <Input
          className="h-8 text-sm"
          placeholder="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          className="h-8 text-sm"
          placeholder="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <Button className="w-full h-9 text-sm">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
