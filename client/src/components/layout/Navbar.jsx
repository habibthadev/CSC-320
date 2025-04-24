import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  User,
  FileText,
  HelpCircle,
  Book,
} from "lucide-react";
import Button from "../ui/Button";
import useAuthStore from "../../stores/authStore";
import useThemeStore from "../../stores/themeStore";
import { slideInRight } from "../../utils/animations";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = React.useRef(null);

  useEffect(() => {
    if (navRef.current) {
      slideInRight(navRef.current, 0.2);
    }
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Documents", path: "/documents", icon: FileText, auth: true },
    { name: "Help", path: "/help", icon: HelpCircle, auth: false },
  ];

  return (
    <nav
      ref={navRef}
      className="bg-white shadow-sm dark:bg-gray-900 dark:border-b dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                Haskmee
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map(
              (link) =>
                (!link.auth || (link.auth && isAuthenticated)) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === link.path
                        ? "text-orange-600 dark:text-orange-500"
                        : "text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <link.icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </div>
                  </Link>
                )
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.name || "Profile"}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={LogOut}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" to="/login">
                  Login
                </Button>
                <Button variant="primary" size="sm" to="/register">
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500 mr-2"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map(
              (link) =>
                (!link.auth || (link.auth && isAuthenticated)) && (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === link.path
                        ? "text-orange-600 dark:text-orange-500"
                        : "text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </div>
                  </Link>
                )
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {isAuthenticated ? (
              <div className="px-2 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-500"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-orange-600 dark:text-orange-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
