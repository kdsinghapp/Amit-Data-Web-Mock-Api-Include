import React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

export default function SideNav({ items, title = "Menu" }) {
  return (
    <div className="page-sidebar p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-3 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => clsx("page-item", isActive && "page-item-active")}
          >
            <span className="truncate">{it.label}</span>
            <span className={clsx("text-slate-400", "group-hover:text-slate-600", "aria-[current=page]:text-white")}>→</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
