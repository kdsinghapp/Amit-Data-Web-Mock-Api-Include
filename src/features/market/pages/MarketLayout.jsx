import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

export default function MarketLayout({
  active,
  items,
  subItems = [],
  children,
}) {
  const [open, setOpen] = useState(() => new Set());
  const [subItemsMap, setSubItemsMap] = useState(() => ({}));
  const acRef = useRef(null); // used for subitems fetches
  const itemsAcRef = useRef(null); // used for top-level items fetch
  const [fetchedItems, setFetchedItems] = useState(null);

  useEffect(() => {
    return () => {
      if (acRef.current) {
        acRef.current.abort();
        acRef.current = null;
      }
      if (itemsAcRef.current) {
        itemsAcRef.current.abort();
        itemsAcRef.current = null;
      }
    };
  }, []);

  // Fetch top-level market items from API when `items` prop not provided
  useEffect(() => {
    if (items) return;
    // avoid refetch if already fetched
    if (fetchedItems !== null) return;

    const endpoint = "http://localhost:3001/business-marketdata";
    const ac = new AbortController();
    itemsAcRef.current = ac;

    fetch(endpoint, { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => {
        const entries = json?.Data || json?.data || json || {};
        const parsed = Object.keys(entries).map((k) => {
          const e = entries[k] || {};
          const key = (k || "").toLowerCase().replace(/\s+/g, "-");
          const to = e.path ? `${e.path}` : e.path || e.to || "#";
          return {
            key,
            label: k,
            to,
            apiEndpoint:
              e.apiEndpoint || e.endpoint || e.childrenEndpoint || null,
          };
        });
        setFetchedItems(parsed);
      })
      .catch(() => {
        setFetchedItems([]);
      })
      .finally(() => {
        itemsAcRef.current = null;
      });
  }, [items, fetchedItems]);

  const toggle = (it) => {
    const to = it.to || it.key || it.label;
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(to)) next.delete(to);
      else next.add(to);
      return next;
    });

    const willExpand = !open.has(to);
    if (willExpand && it.apiEndpoint && !subItemsMap[it.key]) {
      if (acRef.current) acRef.current.abort();
      const ac = new AbortController();
      acRef.current = ac;

      fetch(it.apiEndpoint, { signal: ac.signal })
        .then((res) => res.json())
        .then((json) => {
          const entries = json?.Data || json?.data || json || {};
          const parsed = Object.keys(entries).map((k) => {
            const e = entries[k] || {};
            return {
              label: k,
              to: e.path ? `/data/market${e.path}` : e.path || e.to || "#",
            };
          });
          setSubItemsMap((prev) => ({ ...prev, [it.key]: parsed }));
        })
        .catch(() => {
          setSubItemsMap((prev) => ({ ...prev, [it.key]: [] }));
        })
        .finally(() => {
          acRef.current = null;
        });
    }
  };

  const baseItems = items || fetchedItems || [];

  const itemsWithChildren = baseItems.map((it) => {
    const key =
      it.key || (it.to ? it.to : it.label?.toLowerCase().replace(/\s+/g, "-"));
    const normalized = { key, ...it };
    const itemChildren =
      subItems && subItems.length ? subItems : subItemsMap[key];
    if (!itemChildren || !itemChildren.length) return normalized;
    const isActiveCategory =
      normalized.to === active || (active && active.startsWith(normalized.to));
    const isExpanded =
      isActiveCategory || open.has(normalized.to || normalized.key);
    return isExpanded ? { ...normalized, children: itemChildren } : normalized;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Market Data
        </div>

        <div className="mt-3">
          <div className="bg-white rounded-md border border-slate-100 overflow-hidden">
            {itemsWithChildren.map((it, idx) => {
              const identifier = it.to || it.key;
              const isActiveCategory =
                it.to === active ||
                (active && it.to && active.startsWith(it.to));
              const isExpanded = isActiveCategory || open.has(it.to || it.key);

              return (
                <div
                  key={identifier}
                  className={idx === 0 ? "" : "border-t border-slate-100"}
                >
                  <div className="flex items-center justify-between">
                    {it.to ? (
                      <NavLink
                        to={it.to}
                        className={({ isActive }) =>
                          clsx(
                            "flex-1 block px-4 py-2 text-sm truncate transition-colors",
                            isActive || isActiveCategory
                              ? "bg-slate-100 text-slate-900 font-semibold"
                              : "text-slate-700 hover:bg-slate-50",
                          )
                        }
                      >
                        <span className="flex items-center justify-between">
                          <span>{it.label}</span>
                        </span>
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggle(it)}
                        className={clsx(
                          "flex-1 text-left px-4 py-2 text-sm truncate transition-colors",
                          isActiveCategory
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-700 hover:bg-slate-50",
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span>{it.label}</span>
                        </span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle(it);
                      }}
                      aria-expanded={isExpanded}
                      className="px-3 py-2 text-slate-400 hover:text-slate-600"
                    >
                      <span
                        className={clsx(
                          "text-xs transition-transform inline-block",
                          isExpanded ? "rotate-90" : "",
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
                                isActive
                                  ? "text-slate-900 font-medium"
                                  : "text-slate-600 hover:bg-slate-50",
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
