import { forwardRef } from "react";

const Input = forwardRef(
  ({ className = "", type = "text", error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : ""
          } ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
