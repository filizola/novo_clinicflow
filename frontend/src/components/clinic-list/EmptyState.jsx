import React from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 px-6 py-14 text-center", className)}>
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-gray-700">{title}</h2>
        {description ? <p className="max-w-md text-sm text-gray-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
