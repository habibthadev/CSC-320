import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { KeyRound, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
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

const ResetPassword = () => {
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
    } else {
      toast.error(error || "Failed to reset password. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center dark:bg-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been reset successfully. You can now login with
              your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Button to="/login" className="w-full max-w-xs">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <Card className="w-full max-w-md" ref={formRef}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" required>
                New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  error={errors.password}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                Confirm New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  error={errors.confirmPassword}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="w-full"
          >
            Reset Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
