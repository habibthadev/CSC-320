import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { KeyRound, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Alert } from "../../components/ui/Alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/Card";
import useAuthStore from "../../stores/authStore";
import { fadeIn } from "../../utils/animations";
import useTheme from "../../hooks/useTheme";

const ResetPassword = () => {
  useTheme();
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPasswordWithToken, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset token");
      navigate("/login");
    }

    if (formRef.current) {
      fadeIn(formRef.current, 0.2);
    }
  }, [token, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { success, error } = await resetPasswordWithToken(
      token,
      formData.password
    );

    if (success) {
      setIsSuccess(true);
      toast.success("Password reset successful!");
    } else if (error) {
      toast.error(error || "Failed to reset password. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border bg-card">
          <CardHeader className="space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
              <CheckCircle className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-card-foreground">
                Password Reset Successful
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your password has been reset successfully. You can now login
                with your new password.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Link
        to="/login"
        className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>

      <Card className="w-full max-w-md border bg-card" ref={formRef}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-card-foreground">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" required className="text-foreground">
                New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                  error={errors.password}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required className="text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                  error={errors.confirmPassword}
                />
              </div>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600">
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
