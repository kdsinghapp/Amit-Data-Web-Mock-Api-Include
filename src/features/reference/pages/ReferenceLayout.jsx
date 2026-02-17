import React from "react";
import SideNav from "../../../components/SideNav.jsx";

const items = [
  { label: "Global Fundamentals", to: "/data/reference/fundamentals" },
  { label: "Corporate actions", to: "/data/reference/actions" },
  { label: "Trading schedules", to: "/data/reference/schedules" },
];

export default function ReferenceLayout({ children }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reference data</div>
        <div className="mt-3">
          <SideNav title="Reference data" items={items} />
        </div>
      </aside>
      <section className="lg:col-span-9">{children}</section>
    </div>
  );
}
