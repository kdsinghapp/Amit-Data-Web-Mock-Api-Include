import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Database, Phone, ShoppingCart } from "lucide-react";
import clsx from "clsx";

import MegaMenu from "./MegaMenu.jsx";
import { api } from "../../api/platformApi.js";
import { useCart } from "../../data/cart.jsx";
import { useBillingRegion } from "../../data/billingRegion.jsx";

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    function onDown(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onOutside();
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [ref, onOutside]);
}

export default function Navbar() {
  const [openData, setOpenData] = useState(false);
  const [segment, setSegment] = useState("Business");
  const [topNav, setTopNav] = useState(null);

  const containerRef = useRef(null);
  const location = useLocation();
  const cart = useCart();
  const billing = useBillingRegion();
  const [menuData, setMenuData] = useState(null);
  const [megaItems, setMegaItems] = useState(null);

  useEffect(() => setOpenData(false), [location.pathname, location.search]);
  useClickOutside(containerRef, () => setOpenData(false));

  // Load top navigation from API only.
  useEffect(() => {
    const ac = new AbortController();

    fetch("http://localhost:3001/menu", { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => {
        setMenuData(json);
        // compute initial topNav for current segment
        const segKey = segment === "Business" ? "Business" : "Professional";
        const tabs = json?.tabs?.[segKey] || {};
        const items = Object.keys(tabs).map((k) => {
          const entry = tabs[k];
          if (!entry) return { key: k.toLowerCase(), label: k, to: null };
          const isData = k === "Data";
          return {
            key: k.toLowerCase(),
            label: k,
            to: entry.path || "/",
            kind: isData ? "mega" : undefined,
          };
        });

        const hasMegaData = items.some((it) => it.key === "data" && it.kind === "mega");
        const withData = hasMegaData ? items : [{ key: "data", label: "Data", to: "/BusData", kind: "mega" }, ...items];

        setTopNav(withData);
      })
      .catch(() => {
        setTopNav([]);
        setMenuData(null);
      });

    return () => ac.abort();
  }, []);

  // recompute topNav whenever segment changes (keeps menu in sync)
  useEffect(() => {
    if (!menuData) return;
    const segKey = segment === "Business" ? "Business" : "Professional";
    const tabs = menuData.tabs?.[segKey] || {};
    const items = Object.keys(tabs).map((k) => {
      const entry = tabs[k];
      if (!entry) return { key: k.toLowerCase(), label: k, to: null };
      const isData = k === "Data";
      return {
        key: k.toLowerCase(),
        label: k,
        to: entry.path || "/",
        kind: isData ? "mega" : undefined,
      };
    });

    const hasMegaData = items.some((it) => it.key === "data" && it.kind === "mega");
    const withData = hasMegaData ? items : [{ key: "data", label: "Data", to: "/BusData", kind: "mega" }, ...items];

    setTopNav(withData);
  }, [menuData, segment]);

  // Fetch mega menu items when the Data menu opens (or when segment changes and open)
  useEffect(() => {
    if (!openData) return;
    const ac = new AbortController();

    // Prefer using the apiEndpoint from /menu if present
    const segKey = segment === "Business" ? "Business" : "Professional";
    const dataEntry = menuData?.tabs?.[segKey]?.Data;
    const endpoint =
      dataEntry?.apiEndpoint ||
      (segment === "Business" ? "http://localhost:3001/business-Data" : "http://localhost:3001/professional-data");

    fetch(endpoint, { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => {
        const entries = json?.Data || json || {};
        const parsed = Object.keys(entries).map((k) => {
          const e = entries[k] || {};
          return {
            key: k.toLowerCase().replace(/\s+/g, "-"),
            label: k,
            to: e.path || null,
            apiEndpoint: e.apiEndpoint || null,
          };
        });
        setMegaItems(parsed);
      })
      .catch(() => setMegaItems(null));

    return () => ac.abort();
  }, [openData, segment, menuData]);

  return (
    <header className="sticky top-0 z-50 bg-blue-950 text-blue-50 border-b border-blue-300/15">
      <div ref={containerRef} className="mx-auto max-w-6xl px-4">
        <div className="hidden sm:flex items-center justify-between py-2 text-xs text-slate-300/70">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSegment("Business")}
              className={clsx("hover:text-white", segment === "Business" && "text-white")}
            >
              Business
            </button>
            <button
              type="button"
              onClick={() => setSegment("Individuals")}
              className={clsx("hover:text-white", segment === "Individuals" && "text-white")}
            >
              Individuals
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-300/70">Region</span>
              <select
                value={billing.billingRegionKey}
                onChange={(e) => billing.setBillingRegionKey(e.target.value)}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
              >
                {(billing.regions || []).map((r) => (
                  <option key={r.key} value={r.key} className="text-slate-900">
                    {r.label} • {r.currency}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/subscription"
              className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
            >
              Order Data
            </Link>
          </div>
        </div>

        <div className="flex h-14 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <Database className="h-4 w-4 text-orange-400" />
            </span>
            <span className="text-sm font-semibold tracking-wide">Data</span>
          </Link>

          <nav className="flex items-center gap-1">
            {topNav
              ? topNav.map((item) => {
                  if (item.kind === "mega") {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onMouseEnter={() => setOpenData(true)}
                        onClick={() => setOpenData((v) => !v)}
                        className={clsx(
                          "px-3 py-2 rounded-lg text-sm font-medium transition",
                          openData ? "bg-white/10 text-white" : "text-slate-200/90 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      className={({ isActive }) =>
                        clsx(
                          "px-3 py-2 rounded-lg text-sm font-medium transition",
                          isActive ? "bg-white/10 text-white" : "text-slate-200/90 hover:bg-white/5 hover:text-white"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  );
                })
              : null}
          </nav>

          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200/85 hover:bg-white/10"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {cart.count > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                {cart.count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200/85 hover:bg-white/10"
          >
            <Phone className="h-4 w-4" />
            Contact Sales
          </button>
        </div>

        <div className="relative">
          <MegaMenu open={openData} onClose={() => setOpenData(false)} items={megaItems} />
        </div>
      </div>
    </header>
  );
}