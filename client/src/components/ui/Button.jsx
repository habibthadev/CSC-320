import React from "react";
import { Link } from "react-router-dom";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        orange: "bg-orange text-orange-foreground hover:bg-orange/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      to,
      icon: Icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : to ? Link : "button";

    if (to) {
      return (
        <Comp
          to={to}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {children}
            </span>
          ) : (
            <span className="flex items-center">
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {children}
            </span>
          )}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </span>
        ) : (
          <span className="flex items-center">
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {children}
          </span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
