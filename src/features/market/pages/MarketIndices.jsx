// pages/MarketIndices.jsx (your page becomes very small)
import React, { useEffect, useState } from "react";
import DynamicKitPage from "./DynamicKit";

export default function Indices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    fetch("http://localhost:3001/business-Indices", { signal: ac.signal })
      .then((r) => r.json())
      .then((json) => {
        setData(json?.IndicesPage || json);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(String(e?.message || e));
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error)
    return <div className="p-6 text-red-600">Failed to load: {error}</div>;

  return (
    <DynamicKitPage
      pageTitle={data?.pageTitle}
      pageContent={data?.PageContent || {}}
      pageConfig={data?.Indices || data} // works even if shape changes
    />
  );
}
