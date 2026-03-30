import React from "react";
import { cn } from "@/lib/utils";
import Input from "./Input";

export default function FormField({
  label,
  value,
  onChange,
  readOnly = false,
  required = false,
  type = "text",
  placeholder,
  emptyValue = "-",
  className,
  inputClassName,
  wrapperClassName,
  id,
  error,
  hint
}) {
  if (readOnly) {
    const hasValue = value !== undefined && value !== null && String(value).trim() !== "";

    return (
      <div className={cn("space-y-1.5", className, wrapperClassName)}>
        <div className="mb-1 block text-sm font-medium text-gray-700">{label}</div>
        <div
          id={id}
          className={cn(
            "min-h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm",
            !hasValue ? "text-gray-400" : "",
            inputClassName
          )}
        >
          {hasValue ? String(value) : emptyValue}
        </div>
      </div>
    );
  }

  return (
    <Input
      id={id}
      type={type}
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      error={error}
      hint={hint}
      wrapperClassName={cn(className, wrapperClassName)}
      inputClassName={inputClassName}
    />
  );
}
