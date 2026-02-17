import React from "react";

export default function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{eyebrow}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600 leading-relaxed">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </div>
  );
}
