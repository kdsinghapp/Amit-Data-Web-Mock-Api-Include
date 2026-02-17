import React from "react";
import clsx from "clsx";

export default function Badge({ children, variant = "slate" }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold",
      variant === "slate" && "border-slate-200 bg-slate-50 text-slate-700",
      variant === "orange" && "border-orange-200 bg-orange-50 text-orange-700"
    )}>
      {children}
    </span>
  );
}
