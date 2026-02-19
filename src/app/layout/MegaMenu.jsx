import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function MegaMenu({ open, onClose, items }) {
  const [activeKey, setActiveKey] = useState(null);
  const [activeLabel, setActiveLabel] = useState("");
  const [subItems, setSubItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const acRef = useRef(null);

  useEffect(() => {
    if (!open) {
      clear();
    }
    return () => {
      if (acRef.current) {
        acRef.current.abort();
        acRef.current = null;
      }
    };
  }, [open]);

  function clear() {
    setActiveKey(null);
    setActiveLabel("");
    setSubItems(null);
    setLoading(false);
    if (acRef.current) {
      acRef.current.abort();
      acRef.current = null;
    }
  }

  async function handleHover(item) {
    if (!item) return;
    setActiveKey(item.key);
    setActiveLabel(item.label || "");
    setSubItems(null);

    const endpoint = item.apiEndpoint;
    if (!endpoint) return;

    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;
    setLoading(true);

    try {
      const res = await fetch(endpoint, { signal: ac.signal });
      const json = await res.json();
      const entries = json?.Data || json?.data || json || {};
      const parsed = Object.keys(entries).map((k) => {
        const e = entries[k] || {};
        return {
          key: k.toLowerCase().replace(/\s+/g, "-"),
          label: k,
          to: e.path || e.to || "#",
        };
      });
      setSubItems(parsed);
    } catch (err) {
      if (err.name !== "AbortError") {
        setSubItems([]);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="absolute left-0 right-0 mt-2 z-40"
      onMouseLeave={onClose}
      aria-hidden={!open}
    >
      <div className="mx-auto max-w-7xl text-slate-100 rounded-2xl shadow-xl border border-white/5 overflow-hidden"
           style={{ background: "linear-gradient(180deg, rgba(6,20,38,0.95), rgba(6,20,38,0.95) 100%)" }}>
        <div
          className="grid"
          style={{ gridTemplateColumns: "1.2fr 0.9fr 1fr" }}
        >
          {/* Left column: description */}
          <div className="p-8 lg:p-10 border-r border-white/5 bg-[#061026] rounded-l-2xl">
            <div className="flex items-start gap-4">
              <div>
                <div className="text-2xl font-semibold text-slate-100">
                  Data
                </div>
                <p className="mt-3 text-sm text-slate-300 max-w-xs leading-relaxed">
                  Discover a range of reliable and comprehensive financial
                  data services with ultra-low latency APIs and historical
                  replay.
                </p>
              </div>
            </div>
          </div>

          {/* Middle column: categories */}
          <div className="p-6 lg:p-8 border-r border-white/5 bg-[#071226]">
            <div className="text-xs uppercase text-slate-300 mb-3">Data</div>
            <ul className="space-y-2">
              {(items || []).map((it) => (
                <li key={it.key}>
                  <button
                    type="button"
                    onMouseEnter={() => handleHover(it)}
                    className={
                      "flex w-full items-center justify-between rounded-md px-4 py-3 text-sm transition " +
                      (activeKey === it.key
                        ? "bg-[#081827] text-orange-400 font-semibold shadow-inner border-l-4 border-orange-500"
                        : "text-slate-200 hover:bg-white/5")
                    }
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-sm">{it.label}</span>
                    </span>
                    <span
                      className={
                        activeKey === it.key ? "text-orange-300" : "text-slate-400"
                      }
                    >
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: subitems */}
          <div className="p-6 lg:p-8 bg-[#061427] rounded-r-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-slate-300">
                  {activeLabel ? "Market Data" : "Select"}
                </div>
                <div className="text-lg font-semibold mt-1 text-slate-100">
                  {activeLabel || ""}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {loading && <div className="text-sm text-slate-400">Loading…</div>}

              {!loading && (!subItems || subItems.length === 0) && (
                <div className="text-sm text-slate-400">
                  Hover a category in the center to see details
                </div>
              )}

              {!loading && subItems && subItems.length > 0 && (
                <div className="space-y-3">
                  {subItems.map((s) => (
                    <Link
                      key={s.key}
                      to={s.to}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-md px-4 py-3 bg-transparent hover:bg-white/3 transition border border-transparent hover:border-white/6"
                    >
                      <div className="font-medium text-slate-100">
                        {s.label}
                      </div>
                      <div className="text-sm text-slate-300">→</div>
                    </Link>
                  ))}
                  <div className="pt-2">
                    <Link
                      to="#"
                      onClick={onClose}
                      className="text-orange-400 hover:underline text-sm"
                    >
                      Explore All →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}