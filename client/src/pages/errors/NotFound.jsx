import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, HelpCircle } from "lucide-react";
import Button from "../../components/ui/Button";
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
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center" ref={contentRef}>
        <div className="mb-8">
          <div className="text-orange-500 dark:text-orange-400 font-bold text-9xl">
            404
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              icon={ArrowLeft}
              className="w-full"
            >
              Go Back
            </Button>
            <Button to="/" icon={Home} className="w-full">
              Return to Home
            </Button>
            <Button
              to="/help"
              variant="outline"
              icon={HelpCircle}
              className="w-full"
            >
              Visit Help Center
            </Button>
          </div>
        </div>

        <div className="text-gray-600 dark:text-gray-400 text-sm">
          <p>
            If you believe this is an error, please{" "}
            <a
              href="mailto:adebayohabib7@gmail.com"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
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
