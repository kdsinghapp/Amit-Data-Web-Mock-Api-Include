// [src/features/coverage/pages/CoveragePlaceholder.jsx](src/features/coverage/pages/CoveragePlaceholder.jsx#L1)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../../components/PageHeader.jsx";
import CoverageLayout from "./CoverageLayout.jsx";
import { api } from "../../../api/platformApi.js";

export default function CoveragePlaceholder() {
  const { region } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    api
      .productsByRegion(region, { signal: ac.signal })
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [region]);

  const titleMap = { canada: "Canada", eu: "European Union", turkey: "Turkey", apac: "APAC", australia: "Australia", global: "Global" };
  const title = titleMap[region] || "Coverage";

  return (
    <div>
      <PageHeader eyebrow="Coverage" title={title} />
      <CoverageLayout>
        <div className="page-surface p-6">
          {loading ? <div>Loading coverage…</div> : <pre className="text-sm text-slate-600">{JSON.stringify(data, null, 2)}</pre>}
        </div>
      </CoverageLayout>
    </div>
  );
}