import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";
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
import {
  useForgotPassword,
  useVerifyOTP,
  useResetPassword,
  useAuth,
} from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";

const ForgotPassword = () => {
  useTheme();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const forgotPasswordMutation = useForgotPassword();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/documents", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const verifyOTPMutation = useVerifyOTP();
  const resetPasswordMutation = useResetPassword();

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

    forgotPasswordMutation.mutate(email, {
      onSuccess: () => {
        setStep(2);
      },
    });
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!validateOTP()) return;

    verifyOTPMutation.mutate(
      { email, otp },
      {
        onSuccess: () => {
          setStep(3);
        },
      }
    );
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    resetPasswordMutation.mutate(
      { email, otp, password },
      {
        onSuccess: () => {
          setStep(4);
        },
      }
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required className="text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                  error={errors.email}
                />
              </div>
            </div>
            {forgotPasswordMutation.isError && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                {forgotPasswordMutation.error?.response?.data?.message ||
                  "Failed to send reset code"}
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
              isLoading={forgotPasswordMutation.isPending}
            >
              Send Reset Code
            </Button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" required className="text-foreground">
                Verification Code
              </Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                error={errors.otp}
                className="text-center text-lg tracking-widest border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Please enter the 6-digit code sent to {email}
              </p>
            </div>
            {verifyOTPMutation.isError && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                {verifyOTPMutation.error?.response?.data?.message ||
                  "Invalid verification code"}
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
              isLoading={verifyOTPMutation.isPending}
            >
              Verify Code
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-input text-foreground hover:bg-muted"
              onClick={() => setStep(1)}
            >
              Back to Email
            </Button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" required className="text-foreground">
                New Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                  error={errors.confirmPassword}
                />
              </div>
            </div>
            {resetPasswordMutation.isError && (
              <Alert variant="destructive" className="border-red-200 dark:border-red-800">
                {resetPasswordMutation.error?.response?.data?.message ||
                  "Failed to reset password"}
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
              isLoading={resetPasswordMutation.isPending}
            >
              Reset Password
            </Button>
          </form>
        );
      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
              <CheckCircle className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-card-foreground">
                Password Reset Successful
              </h3>
              <p className="text-muted-foreground">
                Your password has been reset successfully. You can now login
                with your new password.
              </p>
            </div>
            <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

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
            {step === 4 ? "Password Reset" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 1 && "Enter your email to receive a password reset code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new password for your account"}
            {step === 4 && "Your password has been successfully reset"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        {step < 4 && (
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground mt-2">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium underline underline-offset-4"
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
