import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, HelpCircle, Search, MapPin } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { fadeIn } from "../../utils/animations";

const NotFound = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      fadeIn(contentRef.current, 0.2);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center" ref={contentRef}>
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200 dark:text-gray-800 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-teal-100 dark:bg-teal-900 p-4">
                <MapPin className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2 text-foreground">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Card className="border bg-card shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full border-input text-foreground hover:bg-muted"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button 
                onClick={() => navigate("/")} 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
              <Button
                onClick={() => navigate("/help")}
                variant="outline"
                className="w-full border-input text-foreground hover:bg-muted"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Visit Help Center
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate("/documents")}
            variant="ghost"
            className="h-auto p-4 flex-col text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Search className="h-6 w-6 mb-2" />
            <span className="text-sm">Browse Documents</span>
          </Button>
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            className="h-auto p-4 flex-col text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Home className="h-6 w-6 mb-2" />
            <span className="text-sm">Your Profile</span>
          </Button>
        </div>

        <div className="text-gray-600 dark:text-gray-400 text-sm">
          <p>
            If you believe this is an error, please{" "}
            <a
              href="mailto:adebayohabib7@gmail.com"
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline font-medium"
            >
              contact our support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
