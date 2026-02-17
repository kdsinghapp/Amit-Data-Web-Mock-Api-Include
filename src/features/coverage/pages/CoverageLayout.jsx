// [src/features/coverage/pages/CoverageLayout.jsx](src/features/coverage/pages/CoverageLayout.jsx#L1)
import React, { useEffect, useState } from "react";
import SideNav from "../../../components/SideNav.jsx";
import { api } from "../../../api/platformApi.js";

export default function CoverageLayout({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    api
      .regions({ signal: ac.signal })
      .then((regions) => {
        setItems(
          regions.map((r) => ({
            label: r.name || r.title || r.label,
            to: `/data/coverage/${r.key || r.slug || r.id}`,
          }))
        );
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Coverage</div>
        <div className="mt-3">
          {loading ? <div className="text-sm text-slate-500">Loading…</div> : <SideNav title="Coverage" items={items} />}
        </div>
      </aside>
      <section className="lg:col-span-9">{children}</section>
    </div>
  );
}