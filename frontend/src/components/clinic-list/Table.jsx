import React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, children }) {
  return <thead className={cn("bg-gray-50", className)}>{children}</thead>;
}

export function TableBody({ className, children }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableHeaderCell({ className, children, ...props }) {
  return (
    <th
      className={cn(
        "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <tr
      className={cn("border-b border-gray-100 transition duration-200 hover:bg-gray-50", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn("px-6 py-4 align-middle text-gray-700", className)} {...props}>
      {children}
    </td>
  );
}
