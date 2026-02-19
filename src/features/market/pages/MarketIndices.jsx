import React, { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import MarketLayout from "./MarketLayout.jsx";

function DynamicForm({ form }) {
  const fields = form?.Inputfields || {};
  const apiEndpoint = form?.apiEndpoint;
  const [values, setValues] = useState(
    Object.keys(fields).reduce((acc, k) => {
      acc[fields[k].name || k] = "";
      return acc;
    }, {}),
  );
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(name, val) {
    setValues((s) => ({ ...s, [name]: val }));
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setResp(null);
    setError(null);

    if (!apiEndpoint || apiEndpoint.includes("{")) {
      setError("API endpoint is not configured for this form.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await r.json().catch(() => null);
      if (!r.ok) {
        setError(`Request failed (${r.status})`);
        setResp(json || String(await r.text()));
      } else {
        setResp(json);
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {form.formTitle || "Form"}
          </div>
          <div className="text-xs text-slate-500">{form.type || ""}</div>
        </div>
        <button
          onClick={handleSubmit}
          className="rounded-md bg-blue-700 text-white px-3 py-1 text-sm"
        >
          {loading ? "Submitting…" : "Submit"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(fields).map((k) => {
          const f = fields[k];
          const name = f.name || k;
          const label = f.label || name;
          const type = (f.fieldType || "text").toLowerCase();
          return (
            <div key={k}>
              <label className="text-xs text-slate-600 block mb-1">
                {label}
              </label>
              {type === "date" ? (
                <input
                  type="date"
                  value={values[name] || ""}
                  onChange={(e) => handleChange(name, e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              ) : (
                <input
                  type="text"
                  value={values[name] || ""}
                  onChange={(e) => handleChange(name, e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
              )}
            </div>
          );
        })}
      </form>

      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-1">cURL example</div>
        <div className="bg-slate-900 text-white p-3 rounded text-xs overflow-auto">
          {apiEndpoint && !apiEndpoint.includes("{")
            ? `curl -X POST ${apiEndpoint} -H "Content-Type: application/json" -d '${JSON.stringify(values)}'`
            : "Endpoint not configured — replace the placeholder in the API JSON to enable submits."}
        </div>
      </div>

      <div className="mt-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        ) : null}

        {resp ? (
          <div className="mt-3 bg-white border rounded p-3 text-sm">
            <pre className="whitespace-pre-wrap text-xs">
              {JSON.stringify(resp, null, 2)}
            </pre>
          </div>
        ) : (
          !error && (
            <div className="mt-3 text-sm text-slate-500">No results.</div>
          )
        )}
      </div>
    </div>
  );
}

function EditorPreview({ editor }) {
  const [code, setCode] = useState("// sample");
  return (
    <div className="page-surface p-4">
      <div className="text-sm font-semibold mb-2">
        {editor.title || editor.path || "Editor"}
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-40 p-2 border rounded bg-slate-50 text-xs"
      />
      <div className="mt-2 text-xs text-slate-500">
        Simple in-page editor (no execution).
      </div>
    </div>
  );
}

export default function Indices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ac = new AbortController();
    setLoading(true);
    setError(null);
    fetch("http://localhost:3001/business-Indices", { signal: ac.signal })
      .then((r) => r.json())
      .then((json) => {
        // endpoint may return nested shape; try to find IndicesPage
        const page = json?.IndicesPage || json;
        setData(page);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(String(e.message || e));
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error)
    return <div className="p-6 text-red-600">Failed to load: {error}</div>;

  const pageTitle = data?.pageTitle || "Indices";
  const pageContent = data?.PageContent || {};
  const indices = data?.Indices || {};
  const embededForms = indices?.EmbededForm || {};
  const editors = indices?.Editor || {};

  return (
    <div>
      <PageHeader eyebrow="Data Analytics" title={pageTitle} />
      <MarketLayout>
         <div className="mt-3 max-w-3xl text-sm text-slate-600">
        {Object.values(pageContent).map((p, i) => (
          <div key={i} className="mb-1">
            {p}
          </div>
        ))}
      </div>
        <div className="grid gap-6 lg:grid-cols-12 mt-6">
          <aside className="lg:col-span-3">
            <div className="bg-slate-900 text-white rounded p-4 space-y-3">
              <div className="text-xs font-semibold uppercase">Indices</div>
              {Object.keys(embededForms).length ? (
                Object.keys(embededForms).map((k) => (
                  <div
                    key={k}
                    className="text-sm bg-slate-800 px-3 py-2 rounded"
                  >
                    {embededForms[k].formTitle || k}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-300">
                  No forms configured.
                </div>
              )}

              <div className="mt-4 text-xs font-semibold uppercase">
                Editors
              </div>
              {Object.keys(editors).length
                ? Object.keys(editors).map((k) => (
                    <div
                      key={k}
                      className="text-sm bg-slate-800 px-3 py-2 rounded"
                    >
                      {editors[k].title || k}
                    </div>
                  ))
                : null}
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-6">
            {Object.keys(embededForms).length ? (
              Object.keys(embededForms).map((k) => (
                <DynamicForm key={k} form={embededForms[k]} />
              ))
            ) : (
              <div className="page-surface p-6">No embedded forms.</div>
            )}

            {Object.keys(editors).length ? (
              <div>
                <div className="text-sm font-semibold mb-2">Editors</div>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.keys(editors).map((k) => (
                    <EditorPreview key={k} editor={editors[k]} />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </MarketLayout>
    </div>
  );
}
