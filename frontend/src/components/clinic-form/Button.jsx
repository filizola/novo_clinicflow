import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
  destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 focus:ring-red-500",
  ghost: "bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-400"
};

const sizes = {
  default: "px-4 py-2",
  sm: "px-3 py-2 text-sm",
  lg: "px-5 py-3"
};

const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "default",
      type = "button",
      disabled = false,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant] || variants.primary,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";

export default Button;
