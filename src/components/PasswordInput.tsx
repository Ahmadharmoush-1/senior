import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPasswordStrength } from "@/lib/validation";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
}

const PasswordInput = ({ value, onChange, label = "Password", id = "password", required }: PasswordInputProps) => {
  const { strength, score } = getPasswordStrength(value);

  const getStrengthColor = () => {
    if (strength === "weak") return "bg-destructive";
    if (strength === "medium") return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthWidth = () => {
    return `${(score / 6) * 100}%`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
      {value && (
        <div className="space-y-1">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-smooth ${getStrengthColor()}`}
              style={{ width: getStrengthWidth() }}
            />
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            Password strength: <span className="font-semibold">{strength}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;