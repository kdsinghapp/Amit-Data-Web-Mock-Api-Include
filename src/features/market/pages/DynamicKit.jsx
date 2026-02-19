// components/DynamicKit.jsx
import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import PageHeader from "../../../components/PageHeader.jsx";
import MarketLayout from "./MarketLayout.jsx";

/* ------------------------- helpers ------------------------- */
function getByPath(obj, path) {
  if (!path) return obj;
  const parts = String(path).split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function toRows(any) {
  if (any == null) return [];

  // common wrappers
  const candidates = [
    any?.rows,
    any?.data,
    any?.result,
    any?.items,
    any?.payload,
    any,
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }

  // object map => array
  if (typeof any === "object") {
    const vals = Object.values(any);
    if (vals.length && vals.every((v) => v && typeof v === "object"))
      return vals;
  }
  return [];
}

function inferColumns(rows) {
  if (!rows?.length) return [];
  const r = rows.find((x) => x && typeof x === "object");
  if (!r) return [];
  return Object.keys(r).map((k) => ({ name: k, label: k, path: k }));
}

function columnsFromSchema(colsObj) {
  if (!colsObj) return [];
  return Object.keys(colsObj).map((k) => {
    const c = colsObj[k] || {};
    const name = c.name || k;
    return { name, label: c.label || name, path: c.path || name };
  });
}

function renderCell(val) {
  if (val == null) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

/**
 * Extract forms/editors from any page config shape.
 * - looks for Indices.EmbededForm, Indices.EmbeddedForm, any nested key with those names
 * - looks for Editor similarly
 */
function extractFormsEditors(pageConfig) {
  if (!pageConfig || typeof pageConfig !== "object") {
    return { forms: {}, editors: {} };
  }

  // direct known spots
  const directForms =
    pageConfig?.EmbededForm ||
    pageConfig?.EmbeddedForm ||
    pageConfig?.Indices?.EmbededForm ||
    pageConfig?.Indices?.EmbeddedForm ||
    {};
  const directEditors = pageConfig?.Editor || pageConfig?.Indices?.Editor || {};

  // if found directly, use it
  if (Object.keys(directForms).length || Object.keys(directEditors).length) {
    return { forms: directForms || {}, editors: directEditors || {} };
  }

  // deep search (first match)
  let foundForms = {};
  let foundEditors = {};

  const stack = [pageConfig];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;

    const f = cur?.EmbededForm || cur?.EmbeddedForm;
    const e = cur?.Editor;

    if (f && typeof f === "object" && Object.keys(f).length) foundForms = f;
    if (e && typeof e === "object" && Object.keys(e).length) foundEditors = e;

    if (Object.keys(foundForms).length || Object.keys(foundEditors).length)
      break;

    for (const v of Object.values(cur)) {
      if (v && typeof v === "object") stack.push(v);
    }
  }

  return { forms: foundForms || {}, editors: foundEditors || {} };
}

/* ------------------------- response renderer ------------------------- */
function DynamicResponse({ form, response }) {
  if (!response) return null;

  const type = String(form?.ResponseType || "json").toLowerCase();
  const schema = form?.Response || {};

  // allow JSON config:
  // Response: { dataPath: "data.rows" } OR { rowsPath: "payload.items" }
  const dataPath = schema?.dataPath || schema?.rowsPath;
  const raw = dataPath ? getByPath(response, dataPath) : response;

  if (type === "chart") {
    const src =
      schema?.src ||
      getByPath(response, "src") ||
      getByPath(response, "data.src") ||
      getByPath(response, "payload.src");

    if (!src) {
      return (
        <div className="mt-3 bg-white border rounded p-3 text-xs">
          Chart configured but image src not found.
          <pre className="mt-2 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="mt-3 bg-white border rounded p-3">
        <img src={src} alt="chart" className="max-w-full rounded" />
      </div>
    );
  }

  if (type === "table") {
    const rows = toRows(raw);
    const colsSchema = schema?.Columns;
    const columns = colsSchema
      ? columnsFromSchema(colsSchema)
      : inferColumns(rows);

    const rowHeaderName = schema?.RowHeaders?.name;
    const rowHeaderLabel = schema?.RowHeaders?.label || rowHeaderName;

    if (!rows.length) {
      return (
        <div className="mt-3 bg-white border rounded p-3 text-xs">
          No rows found in response.
          <pre className="mt-2 whitespace-pre-wrap">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="mt-4 bg-white border rounded">
        <div className="p-3 border-b text-sm font-semibold">Results</div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {rowHeaderName ? (
                  <th className="text-left px-3 py-2 border-b">
                    {rowHeaderLabel}
                  </th>
                ) : null}

                {columns.map((c) => (
                  <th key={c.name} className="text-left px-3 py-2 border-b">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, idx) => {
                const r = row && typeof row === "object" ? row : { value: row };
                const key = r.id || r._id || idx;

                return (
                  <tr key={key} className="odd:bg-white even:bg-slate-50">
                    {rowHeaderName ? (
                      <td className="px-3 py-2 border-b align-top">
                        {renderCell(getByPath(r, rowHeaderName))}
                      </td>
                    ) : null}

                    {columns.map((c) => (
                      <td key={c.name} className="px-3 py-2 border-b align-top">
                        {renderCell(getByPath(r, c.path))}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // default JSON render
  return (
    <div className="mt-3 bg-white border rounded p-3 text-sm">
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}

/* ------------------------- form runner ------------------------- */
function FieldInput({ field, name, value, onChange }) {
  const label = field?.label || name;
  const type = String(field?.fieldType || "text").toLowerCase();

  // optional select support: field.options = [{label,value}]
  const options = Array.isArray(field?.options) ? field.options : null;

  return (
    <div>
      <label className="text-xs text-slate-600 block mb-1">{label}</label>

      {options ? (
        <select
          className="w-full rounded border px-2 py-1 bg-white"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
        >
          <option value="">Select</option>
          {options.map((op, i) => (
            <option key={i} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      ) : type === "date" ? (
        <input
          type="date"
          className="w-full rounded border px-2 py-1"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : type === "number" ? (
        <input
          type="number"
          className="w-full rounded border px-2 py-1"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : type === "textarea" ? (
        <textarea
          className="w-full rounded border px-2 py-1 min-h-[90px]"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(name, e.target.checked)}
        />
      ) : (
        <input
          type="text"
          className="w-full rounded border px-2 py-1"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </div>
  );
}

export function DynamicFormRunner({ form }) {
  const fields = form?.Inputfields || {};
  const apiEndpoint = form?.apiEndpoint;
  const method = String(form?.method || "POST").toUpperCase(); // allow GET/POST in JSON

  const initialValues = useMemo(() => {
    return Object.keys(fields).reduce((acc, k) => {
      const f = fields[k] || {};
      const name = f.name || k;
      acc[name] = f.defaultValue ?? "";
      return acc;
    }, {});
  }, [fields]);

  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setValues(initialValues);
    setResp(null);
    setError(null);
  }, [initialValues]);

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
      let url = apiEndpoint;
      const fetchOptions = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method === "GET") {
        const qs = new URLSearchParams(values).toString();
        url = qs
          ? `${apiEndpoint}${apiEndpoint.includes("?") ? "&" : "?"}${qs}`
          : apiEndpoint;
      } else {
        fetchOptions.body = JSON.stringify(values);
      }

      const r = await fetch(url, fetchOptions);
      const json = await r.json().catch(() => null);

      if (!r.ok) {
        setError(`Request failed (${r.status})`);
        setResp(json || (await r.text().catch(() => "Request failed")));
      } else {
        setResp(json);
      }
    } catch (err) {
      setError(String(err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {form?.formTitle || "Form"}
          </div>
          <div className="text-xs text-slate-500">{form?.type || ""}</div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-md bg-blue-700 text-white px-3 py-1 text-sm"
          disabled={loading}
        >
          {loading ? "Submitting…" : "Submit"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(fields).map((k) => {
          const f = fields[k] || {};
          const name = f.name || k;
          return (
            <FieldInput
              key={k}
              field={f}
              name={name}
              value={values[name]}
              onChange={handleChange}
            />
          );
        })}
      </form>

      <div className="mt-4">
        <div className="text-xs text-slate-500 mb-1">cURL example</div>
        <div className="bg-slate-900 text-white p-3 rounded text-xs overflow-auto">
          {apiEndpoint && !apiEndpoint.includes("{")
            ? method === "GET"
              ? `curl "${apiEndpoint}?${new URLSearchParams(values).toString()}"`
              : `curl -X POST "${apiEndpoint}" -H "Content-Type: application/json" -d '${JSON.stringify(values)}'`
            : "Endpoint not configured — replace placeholder in API JSON."}
        </div>
      </div>

      <div className="mt-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        ) : null}

        {resp ? (
          <DynamicResponse form={form} response={resp} />
        ) : !error ? (
          <div className="mt-3 text-sm text-slate-500">No results.</div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------- editor preview ------------------------- */
export function DynamicEditorPreview({ editor }) {
  const [code, setCode] = useState("// sample editor, no execution");

  return (
    <div className="page-surface p-4">
      <div className="text-sm font-semibold mb-2">
        {editor?.title || editor?.path || "Editor"}
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-56 p-2 border rounded bg-slate-50 text-xs"
      />

      <div className="mt-2 text-xs text-slate-500">
        Simple in-page editor (no execution).
      </div>
    </div>
  );
}

/* ------------------------- main reusable kit page ------------------------- */
export default function DynamicKitPage({ pageTitle, pageContent, pageConfig }) {
  const { forms, editors } = useMemo(
    () => extractFormsEditors(pageConfig),
    [pageConfig],
  );

  const [active, setActive] = useState({ kind: "form", key: null });

  useEffect(() => {
    if (active.key) return;

    const formKeys = Object.keys(forms || {});
    const editorKeys = Object.keys(editors || {});

    if (formKeys.length) setActive({ kind: "form", key: formKeys[0] });
    else if (editorKeys.length)
      setActive({ kind: "editor", key: editorKeys[0] });
    else setActive({ kind: "none", key: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms, editors]);

  const activeTitle = useMemo(() => {
    if (active.kind === "form" && active.key)
      return forms?.[active.key]?.formTitle || active.key;
    if (active.kind === "editor" && active.key)
      return editors?.[active.key]?.title || active.key;
    return "";
  }, [active, forms, editors]);

  return (
    <div>
      <PageHeader eyebrow="Market Data" title={pageTitle || "Page"} />

      <MarketLayout>
        {!!pageContent && (
          <div className="mt-3 max-w-3xl text-sm text-slate-600">
            {Object.values(pageContent).map((p, i) => (
              <div key={i} className="mb-1">
                {p}
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12 mt-6">
          <aside className="lg:col-span-3">
            <div className="bg-slate-900 text-white rounded p-4 space-y-3">
              <div className="text-xs font-semibold uppercase mt-2">Forms</div>
              {Object.keys(forms || {}).length ? (
                Object.keys(forms).map((k) => {
                  const isActive = active.kind === "form" && active.key === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActive({ kind: "form", key: k })}
                      className={clsx(
                        "w-full text-left text-sm px-3 py-2 rounded transition",
                        isActive
                          ? "bg-blue-700"
                          : "bg-slate-800 hover:bg-slate-700",
                      )}
                    >
                      {forms[k]?.formTitle || k}
                    </button>
                  );
                })
              ) : (
                <div className="text-sm text-slate-300">
                  No forms configured.
                </div>
              )}

              <div className="text-xs font-semibold uppercase mt-4">
                Editors
              </div>
              {Object.keys(editors || {}).length ? (
                Object.keys(editors).map((k) => {
                  const isActive = active.kind === "editor" && active.key === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActive({ kind: "editor", key: k })}
                      className={clsx(
                        "w-full text-left text-sm px-3 py-2 rounded transition",
                        isActive
                          ? "bg-blue-700"
                          : "bg-slate-800 hover:bg-slate-700",
                      )}
                    >
                      {editors[k]?.title || k}
                    </button>
                  );
                })
              ) : (
                <div className="text-sm text-slate-300">
                  No editors configured.
                </div>
              )}
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-6">
            {active.kind === "form" && active.key && forms?.[active.key] ? (
              <DynamicFormRunner key={active.key} form={forms[active.key]} />
            ) : active.kind === "editor" &&
              active.key &&
              editors?.[active.key] ? (
              <DynamicEditorPreview
                key={active.key}
                editor={editors[active.key]}
              />
            ) : (
              <div className="page-surface p-6">
                <div className="text-sm text-slate-600">
                  No item selected / no config found.
                </div>
              </div>
            )}
          </section>
        </div>
      </MarketLayout>
    </div>
  );
}
