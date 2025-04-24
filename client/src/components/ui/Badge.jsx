const Badge = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    primary:
      "bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    success:
      "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100",
    danger: "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100",
    outline:
      "border border-gray-200 bg-transparent text-gray-900 dark:border-gray-700 dark:text-gray-100",
  };

  const sizeClasses = {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Badge;
