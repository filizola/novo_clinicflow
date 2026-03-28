import React from "react";

export function PanelGrid({ children, className = "" }) {
  return <div className={`grid gap-6 ${className}`}>{children}</div>;
}

export function PanelCard({ children, className = "", onClick, role = "button", tabIndex = 0 }) {
  return (
    <div
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

