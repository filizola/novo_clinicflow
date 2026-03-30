import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  (
    {
      label,
      error,
      hint,
      required = false,
      wrapperClassName,
      labelClassName,
      inputClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const describedBy = [hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className={cn("mb-1 block text-sm font-medium text-gray-700", labelClassName)}
          >
            {label}
            {required ? <span className="ml-1 text-blue-600">*</span> : null}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500 focus:ring-red-500" : "",
            inputClassName
          )}
          {...props}
        />

        {hint ? (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        ) : null}

        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-red-500">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
