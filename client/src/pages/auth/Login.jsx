import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
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
import { useLogin, useAuth } from "../../hooks/useAuth";
import useTheme from "../../hooks/useTheme";
import { fadeIn } from "../../utils/animations";

const Login = () => {
  useTheme();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const formRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/documents", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (formRef.current) {
      fadeIn(formRef.current, 0.3);
    }
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md space-y-8" ref={formRef}>
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="mt-8 border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-card-foreground">
              Sign in
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email and password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" required className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                    error={errors.email}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required className="text-foreground">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 border-input bg-background text-foreground focus:border-teal-500 focus:ring-teal-500"
                    error={errors.password}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
                isLoading={loginMutation.isPending}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
