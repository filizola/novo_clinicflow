import React from "react";
import { cn } from "@/lib/utils";

export default function PageHeader({
  badge,
  title,
  description,
  actions,
  className,
  titleClassName = "text-2xl font-semibold text-gray-800"
}) {
  return (
    <section className={cn("rounded-2xl bg-white p-6 shadow-md md:p-8", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          {badge ? (
            <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              {badge}
            </div>
          ) : null}
          <div className="space-y-2">
            <h1 className={titleClassName}>{title}</h1>
            {description ? <p className="max-w-2xl text-sm text-gray-500 md:text-base">{description}</p> : null}
          </div>
        </div>

        {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
      </div>
    </section>
  );
}
