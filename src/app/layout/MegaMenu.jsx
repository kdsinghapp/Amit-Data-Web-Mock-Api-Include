// import React, { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";

// export default function MegaMenu({ open, onClose, items }) {
//   const [activeKey, setActiveKey] = useState(null);
//   const [subItems, setSubItems] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const acRef = useRef(null);

//   useEffect(() => {
//     if (!open) {
//       setActiveKey(null);
//       setSubItems(null);
//       setLoading(false);
//       if (acRef.current) {
//         acRef.current.abort();
//         acRef.current = null;
//       }
//     }
//   }, [open]);

//   useEffect(() => {
//     return () => {
//       if (acRef.current) {
//         acRef.current.abort();
//         acRef.current = null;
//       }
//     };
//   }, []);

//   async function handleHover(item) {
//     setActiveKey(item?.key || null);
//     setSubItems(null);

//     const endpoint = item?.apiEndpoint;
//     if (!endpoint) return;

//     if (acRef.current) {
//       acRef.current.abort();
//     }
//     const ac = new AbortController();
//     acRef.current = ac;
//     setLoading(true);

//     try {
//       const res = await fetch(endpoint, { signal: ac.signal });
//       const json = await res.json();
//       const entries = json?.Data || json?.data || json || {};
//       const parsed = Object.keys(entries).map((k) => {
//         const e = entries[k] || {};
//         return {
//           key: k.toLowerCase().replace(/\s+/g, "-"),
//           label: k,
//           to: e.path || e.to || "#",
//           apiEndpoint: e.apiEndpoint || null,
//         };
//       });
//       setSubItems(parsed);
//     } catch (err) {
//       if (err.name !== "AbortError") {
//         setSubItems(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!open) return null;

//   return (
//     <div
//       className="absolute left-0 right-0 mt-2 bg-white shadow-lg rounded p-6 text-slate-800"
//       onMouseLeave={onClose}
//     >
//       <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
//         <div className="col-span-1">
//           <ul className="space-y-2">
//             {(items || []).map((it) => (
//               <li key={it.key}>
//                 <button
//                   type="button"
//                   onMouseEnter={() => handleHover(it)}
//                   className={`w-full text-left px-3 py-2 rounded ${activeKey === it.key ? "bg-slate-50" : "hover:bg-slate-50"}`}
//                 >
//                   <div className="font-semibold">{it.label}</div>
//                   {it.apiEndpoint && <div className="text-xs text-slate-500">{it.apiEndpoint}</div>}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="col-span-2">
//           {loading && <div className="text-sm text-slate-500">Loading…</div>}
//           {!loading && subItems && subItems.length === 0 && <div className="text-sm text-slate-500">No items</div>}
//           {!loading && subItems && subItems.length > 0 && (
//             <div className="grid grid-cols-2 gap-4">
//               {subItems.map((s) => (
//                 <Link
//                   key={s.key}
//                   to={s.to}
//                   className="block rounded border p-4 hover:bg-slate-50"
//                   onClick={onClose}
//                 >
//                   <div className="font-semibold">{s.label}</div>
//                   {s.apiEndpoint && <div className="text-xs text-slate-500 mt-1">{s.apiEndpoint}</div>}
//                 </Link>
//               ))}
//             </div>
//           )}
//           {!loading && !subItems && <div className="text-sm text-slate-500">Hover a category to see details</div>}
//         </div>
//       </div>
//     </div>
//   );
// }

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
      <div className="mx-auto max-w-6xl bg-blue-950/95 text-slate-100 rounded-md shadow-xl border border-white/5 overflow-hidden">
        <div className="flex">
          {/* Left column: categories */}
          <div className="w-64 bg-blue-900/80 border-r border-white/5 p-4">
            <div className="text-xs uppercase text-slate-300 mb-3">Data</div>
            <ul className="space-y-2">
              {(items || []).map((it) => (
                <li key={it.key}>
                  <button
                    type="button"
                    onMouseEnter={() => handleHover(it)}
                    className={
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition " +
                      (activeKey === it.key
                        ? "bg-orange-500 text-white font-semibold shadow-sm"
                        : "text-slate-200 hover:bg-white/5")
                    }
                  >
                    <span>{it.label}</span>
                    <span className={activeKey === it.key ? "text-white/90" : "text-slate-400"}>→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column: subitems */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-slate-300"> {activeLabel || "Select"} </div>
                <div className="text-lg font-semibold mt-1 text-slate-100">{activeLabel || ""}</div>
              </div>
            </div>

            <div className="mt-6">
              {loading && <div className="text-sm text-slate-400">Loading…</div>}

              {!loading && (!subItems || subItems.length === 0) && (
                <div className="text-sm text-slate-400">Hover a category on the left to see details</div>
              )}

              {!loading && subItems && subItems.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {subItems.map((s) => (
                    <Link
                      key={s.key}
                      to={s.to}
                      onClick={onClose}
                      className="block rounded-md border border-white/5 px-4 py-3 bg-transparent hover:bg-white/3 transition"
                    >
                      <div className="font-medium text-slate-100">{s.label}</div>
                      <div className="text-xs text-slate-300 mt-1">Explore</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}