import { Link } from "react-router-dom";
import { Github, Twitter, Mail, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="flex items-center space-x-2">
                  <span className="font-bold text-2xl">
                    <span className="text-teal-600">Haskm</span>ee
                  </span>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                  Transform your documents into interactive knowledge with
                  AI-powered document intelligence. Upload, analyze, and chat
                  with your content seamlessly.
                </p>
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>Built with</span>
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                  <span>by</span>
                  <a
                    href="https://github.com/habibthadev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-orange transition-colors"
                  >
                    Habib
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="flex flex-col space-y-3">
                <Link
                  to="/documents"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Documents
                </Link>
                <Link
                  to="/chat"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Chat
                </Link>
                <Link
                  to="/generate"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Generate Questions
                </Link>
                <Link
                  to="/help"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Help Center
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Support
              </h3>
              <div className="flex flex-col space-y-3">
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </Link>
                <a
                  href="mailto:adebayohabib7@gmail.com"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="https://github.com/habibthadev/CSC-320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Haskmee. All rights reserved.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                Follow us:
              </span>
              <div className="flex items-center space-x-3">
                <a
                  href="https://github.com/habibthadev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-muted rounded-md transition-all duration-200"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://x.com/habibthadev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-muted rounded-md transition-all duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="mailto:adebayohabib7@gmail.com"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-muted rounded-md transition-all duration-200"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
