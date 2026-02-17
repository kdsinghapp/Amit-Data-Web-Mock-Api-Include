import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const marketItems = [
  { label: "Equities & ETFs", to: "/data/market/equities" },
  { label: "Futures", to: "/data/market/futures" },
  { label: "Options", to: "/data/market/options" },
  { label: "Indices", to: "/data/market/indices" },
  { label: "Fixed income", to: "/data/market/fixed-income" },
  { label: "Forex", to: "/data/market/forex" },
  { label: "Cryptocurrencies", to: "/data/market/crypto" },
  { label: "Spot", to: "/data/market/spot" },
];

export default function MarketLayout({ active, items, subItems = [], children }) {
  const baseItems = items || marketItems;
  const [open, setOpen] = useState(() => new Set());

  const toggle = (to) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(to)) next.delete(to);
      else next.add(to);
      return next;
    });
  };

  const itemsWithChildren = baseItems.map((it) => {
    if (!subItems || !subItems.length) return it;
    const isActiveCategory = it.to === active || (active && active.startsWith(it.to));
    const isExpanded = isActiveCategory || open.has(it.to);
    return isExpanded ? { ...it, children: subItems } : it;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Market Data</div>

        <div className="mt-3">
          <div className="bg-white rounded-md border border-slate-100 overflow-hidden">
            {itemsWithChildren.map((it, idx) => {
              const isActiveCategory = it.to === active || (active && active.startsWith(it.to));
              const isExpanded = isActiveCategory || open.has(it.to);

              return (
                <div key={it.to} className={idx === 0 ? "" : "border-t border-slate-100"}>
                  <div className="flex items-center justify-between">
                    <NavLink
                      to={it.to}
                      className={({ isActive }) =>
                        clsx(
                          "flex-1 block px-4 py-2 text-sm truncate transition-colors",
                          isActive || isActiveCategory
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        )
                      }
                    >
                      <span className="flex items-center justify-between">
                        <span>{it.label}</span>
                      </span>
                    </NavLink>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle(it.to);
                      }}
                      aria-expanded={isExpanded}
                      className="px-3 py-2 text-slate-400 hover:text-slate-600"
                    >
                      <span
                        className={clsx(
                          "text-xs transition-transform inline-block",
                          isExpanded ? "rotate-90" : ""
                        )}
                      >
                        →
                      </span>
                    </button>
                  </div>

                  {it.children?.length && isExpanded ? (
                    <div className="px-4 pb-3">
                      <div className="mt-2 ml-2 pl-3 border-l border-slate-100 flex flex-col gap-1">
                        {it.children.map((sub) => (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            className={({ isActive }) =>
                              clsx(
                                "text-xs truncate px-2 py-1 rounded-sm transition-colors",
                                isActive ? "text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                              )
                            }
                          >
                            {sub.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="lg:col-span-9">{children}</section>
    </div>
  );
}