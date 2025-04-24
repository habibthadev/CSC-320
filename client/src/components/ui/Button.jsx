import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  to,
  onClick,
  type = "button",
  icon: Icon,
  ...props
}) => {
  // Base classes
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  // Size classes
  const sizeClasses = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 py-2 px-4",
    lg: "h-11 px-8 text-base",
    icon: "h-10 w-10",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
    outline:
      "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-100",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100",
    link: "bg-transparent underline-offset-4 hover:underline text-orange-600 dark:text-orange-400 hover:bg-transparent",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",
  };

  // Combine classes
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  // If it's a link
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
      </Link>
    );
  }

  // Regular button
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
