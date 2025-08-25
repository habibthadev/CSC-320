import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
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
import { fadeIn } from "../../utils/animations";

const Login = () => {
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
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <Card className="w-full max-w-md" ref={formRef}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  error={errors.email}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
            <Button
              type="submit"
              className="w-full"
              isLoading={loginMutation.isPending}
              icon={LogIn}
            >
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
