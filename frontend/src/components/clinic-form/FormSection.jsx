import React from "react";
import { cn } from "@/lib/utils";

export default function FormSection({
  title,
  description,
  children,
  className,
  contentClassName
}) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-gray-700">{title}</h2>
        {description ? <p className="text-sm text-gray-500">{description}</p> : null}
      </div>

      <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", contentClassName)}>{children}</div>
    </section>
  );
}
