import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  User,
  FileText,
  HelpCircle,
  MessageSquare,
  PenTool,
} from "lucide-react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth, useLogout } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const logoutMutation = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const navLinks = [
    { name: "Documents", path: "/documents", icon: FileText, auth: true },
    { name: "Chat", path: "/chat", icon: MessageSquare, auth: true },
    { name: "Generate", path: "/generate", icon: PenTool, auth: true },
    { name: "Help", path: "/help", icon: HelpCircle, auth: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="font-bold text-xl sm:text-2xl">
                <span className="text-orange">Haskm</span>ee
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <nav className="flex items-center space-x-6">
              {navLinks.map(
                (link) =>
                  (!link.auth || (link.auth && isAuthenticated)) && (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={cn(
                        "transition-colors hover:text-foreground/80 flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium",
                        location.pathname === link.path
                          ? "text-foreground bg-muted"
                          : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  )
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="hidden lg:flex lg:items-center lg:space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center space-x-2"
                >
                  <Link to="/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-24 truncate">
                      {user?.name || "Profile"}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex lg:items-center lg:space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex lg:hidden items-center space-x-1">
                <ThemeToggle />
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                    <span className="sr-only">Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex lg:hidden items-center space-x-1">
                <ThemeToggle />
                <Button variant="ghost" size="sm" className="text-xs px-2">
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" size="sm" className="text-xs px-2">
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 space-y-2">
              <div className="space-y-1">
                {navLinks.map(
                  (link) =>
                    (!link.auth || (link.auth && isAuthenticated)) && (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                          location.pathname === link.path
                            ? "text-foreground bg-muted"
                            : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <link.icon className="h-5 w-5 flex-shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    )
                )}
              </div>

              {isAuthenticated && (
                <div className="pt-3 border-t border-border/40">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <User className="h-5 w-5 flex-shrink-0" />
                    <span>{user?.name || "Profile"}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
