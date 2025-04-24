import React from "react";

const Avatar = ({
  src,
  alt = "",
  fallback,
  size = "md",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const [error, setError] = React.useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <div
      className={`relative flex shrink-0 overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {src && !error ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {fallback || alt.charAt(0).toUpperCase() || "?"}
        </div>
      )}
    </div>
  );
};

export default Avatar;
