import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a
              href="https://github.com/habib-0007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/habib__01"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="mailto:adebayohabib7@gmail.com"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <span className="sr-only">Email</span>
              <Mail className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center md:text-right text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Haskmee. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center md:justify-start space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/privacy"
            className="hover:text-orange-600 dark:hover:text-orange-500"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="hover:text-orange-600 dark:hover:text-orange-500"
          >
            Terms of Service
          </Link>
          <Link
            to="/help"
            className="hover:text-orange-600 dark:hover:text-orange-500"
          >
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
