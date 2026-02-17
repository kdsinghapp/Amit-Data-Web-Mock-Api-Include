import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Database, Phone, ShoppingCart } from "lucide-react";
import clsx from "clsx";

import MegaMenu from "./MegaMenu.jsx";
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

const MENU_URL = "http://localhost:3001/menu";

function getTabLabel(tabKey, tabObj) {
  return (
    tabObj?.label ||
    tabObj?.displayLabel ||
    tabObj?.displayName ||
    tabObj?.title ||
    tabKey
  );
}

function pickInitialSegment(tabs) {
  const entries = Object.entries(tabs || {});
  const selected = entries.find(
    ([, v]) => v && typeof v === "object" && v.Selected,
  );
  return (selected && selected[0]) || (entries[0] && entries[0][0]) || null;
}

function buildTopNavForSegment(menuData, segment) {
  const segObj = menuData?.tabs?.[segment] || {};
  const rawEntries = Object.entries(segObj);

  return rawEntries
    .filter(([k, v]) => {
      if (k === "Selected") return false;
      if (!v) return false;
      if (typeof v !== "object") return false;
      if (!v.path) return false;
      return true;
    })
    .map(([k, v]) => {
      const key = String(k).toLowerCase();
      const isMega = v.kind === "mega" || v.mega === true || key === "data";
      return {
        key,
        label: v.label || k,
        to: v.path,
        kind: isMega ? "mega" : undefined,
        apiEndpoint: v.apiEndpoint || null,
      };
    });
}

function extractMegaEntries(json) {
  const entries =
    json?.DataContext?.Data || json?.Data || json?.data || json || {};

  return Object.keys(entries).map((k) => {
    const e = entries[k] || {};
    return {
      key: String(k).toLowerCase().replace(/\s+/g, "-"),
      label: e.label || k,
      to: e.path || null,
      apiEndpoint: e.apiEndpoint || null,
    };
  });
}

export default function Navbar() {
  const [openData, setOpenData] = useState(false);

  const [menuData, setMenuData] = useState(null);
  const [segment, setSegment] = useState(null);

  const [megaItems, setMegaItems] = useState(null);

  const containerRef = useRef(null);
  const location = useLocation();
  const cart = useCart();
  const billing = useBillingRegion();

  useEffect(() => setOpenData(false), [location.pathname, location.search]);
  useClickOutside(containerRef, () => setOpenData(false));

  useEffect(() => {
    const ac = new AbortController();

    fetch(MENU_URL, { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => {
        setMenuData(json);
        const initial = pickInitialSegment(json?.tabs || {});
        setSegment(initial);
      })
      .catch(() => {
        setMenuData(null);
        setSegment(null);
      });

    return () => ac.abort();
  }, []);

  const segments = useMemo(() => {
    const tabs = menuData?.tabs || {};
    return Object.entries(tabs).filter(([, v]) => v && typeof v === "object");
  }, [menuData]);

  const topNav = useMemo(() => {
    if (!menuData || !segment) return [];
    return buildTopNavForSegment(menuData, segment);
  }, [menuData, segment]);

  const orderCta = useMemo(() => {
    const o = menuData?.Order?.OrderData;
    if (!o || typeof o !== "object") return null;
    return {
      label: o.label || "Order Data",
      to: o.path || "/",
    };
  }, [menuData]);

  const dataEntry = useMemo(() => {
    return topNav.find((x) => x.key === "data") || null;
  }, [topNav]);

  useEffect(() => {
    if (!openData) return;
    if (!dataEntry?.apiEndpoint) {
      setMegaItems(null);
      return;
    }

    const ac = new AbortController();

    fetch(dataEntry.apiEndpoint, { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => setMegaItems(extractMegaEntries(json)))
      .catch(() => setMegaItems(null));

    return () => ac.abort();
  }, [openData, dataEntry?.apiEndpoint]);

  return (
    <header className="sticky top-0 z-50 bg-blue-950 text-blue-50 border-b border-blue-300/15">
      <div ref={containerRef} className="mx-auto max-w-6xl px-4">
        <div className="hidden sm:flex items-center justify-between py-2 text-xs text-slate-300/70">
          <div className="flex items-center gap-4">
            {segments.length > 0
              ? segments.map(([key, obj]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSegment(key);
                      setOpenData(false);
                      setMegaItems(null);
                    }}
                    className={clsx(
                      "hover:text-white",
                      segment === key && "text-white",
                    )}
                  >
                    {getTabLabel(key, obj)}
                  </button>
                ))
              : null}
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

            {orderCta ? (
              <Link
                to={orderCta.to}
                className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
              >
                {orderCta.label}
              </Link>
            ) : null}
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
            {topNav.map((item) => {
              if (item.kind === "mega") {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onMouseEnter={() => setOpenData(true)}
                    onClick={() => setOpenData((v) => !v)}
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition",
                      openData
                        ? "bg-white/10 text-white"
                        : "text-slate-200/90 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.key}
                  to={item.to || "/"}
                  onClick={() => setOpenData(false)}
                  className={({ isActive }) =>
                    clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-200/90 hover:bg-white/5 hover:text-white",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
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
          <MegaMenu
            open={openData}
            onClose={() => setOpenData(false)}
            items={megaItems}
          />
        </div>
      </div>
    </header>
  );
}
