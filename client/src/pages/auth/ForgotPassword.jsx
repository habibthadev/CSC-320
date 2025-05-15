import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
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

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { forgotPassword, verifyOTP, resetPassword, isLoading } =
    useAuthStore();
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      fadeIn(formRef.current, 0.2);
    }
  }, [step]);

  const validateEmail = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = () => {
    const newErrors = {};

    if (!otp) {
      newErrors.otp = "OTP is required";
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      newErrors.otp = "OTP must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    const { success, error, data } = await forgotPassword(email);

    if (success) {
      toast.success("OTP sent to your email");
      setStep(2);
    } else if (error) {
      toast.error(error || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!validateOTP()) return;

    const { success, error } = await verifyOTP(email, otp);

    if (success) {
      toast.success("OTP verified successfully");
      setStep(3);
    } else if (error) {
      toast.error(error || "Invalid or expired OTP. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    const { success, error } = await resetPassword(email, otp, password);

    if (success) {
      toast.success("Password reset successful!");
      setStep(4);
    } else if (error) {
      toast.error(error || "Failed to reset password. Please try again.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-4" ref={formRef}>
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  error={errors.email}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Send OTP
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4" ref={formRef}>
            <div className="space-y-2">
              <Label htmlFor="otp" required>
                Enter OTP
              </Label>
              <Input
                id="otp"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={errors.otp}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please enter the 6-digit OTP sent to your email
              </p>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Verify OTP
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setStep(1)}
            >
              Back to Email
            </Button>
          </form>
        );
      case 3:
        return (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
            ref={formRef}
          >
            <div className="space-y-2">
              <Label htmlFor="password" required>
                New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  error={errors.confirmPassword}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Reset Password
            </Button>
          </form>
        );
      case 4:
        return (
          <div className="space-y-4 text-center" ref={formRef}>
            <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Password Reset Successful
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your password has been reset successfully. You can now login with
              your new password.
            </p>
            <Button to="/login" className="w-full">
              Go to Login
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            {step < 4 && (
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            <CardTitle className="text-2xl font-bold text-center flex-grow">
              {step === 4 ? "Success" : "Reset Password"}
            </CardTitle>
            <div className="w-5"></div> 
          </div>
          {step < 4 && (
            <CardDescription className="text-center">
              {step === 1 && "Enter your email to receive a password reset OTP"}
              {step === 2 && "Enter the OTP sent to your email"}
              {step === 3 && "Create a new password for your account"}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        {step < 4 && (
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
