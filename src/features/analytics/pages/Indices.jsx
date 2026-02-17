import React, { useEffect, useMemo, useState } from "react";
import indicesConfig from "./indices/config.json";
import PageHeader from "../../../components/PageHeader.jsx";
import AnalyticsLayout from "./AnalyticsLayout.jsx";

const api = {
  indicesConfig: async () => {
    return { data: indicesConfig };
  },
  indicesRun: async (endpoint, values) => {
    // Replace with real call. Example:
    // return request(endpoint, { method: "POST", body: JSON.stringify(values) })
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return { data: await res.json() };
  },
};

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function buildDefaultValues(fields) {
  const v = {};
  (fields || []).forEach((f) => {
    if (f.defaultValue !== undefined) v[f.key] = f.defaultValue;
    else if (f.type === "select") v[f.key] = (f.options || [])[0]?.key || "";
    else if (f.type === "checkbox") v[f.key] = false;
    else v[f.key] = "";
  });
  return v;
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
  );
}

function Field({ field, value, onChange, values }) {
  const common =
    "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

  if (!field) return null;

  if (field.showIf) {
    const cur = values?.[field.showIf.key];
    if ("equals" in field.showIf && cur !== field.showIf.equals) return null;
    if ("notEquals" in field.showIf && cur === field.showIf.notEquals)
      return null;
  }

  const label = field.label || field.key;

  switch (field.type) {
    case "select":
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={common}
          >
            {(field.options || []).map((o) => (
              <option key={o.key} value={o.key}>
                {o.label ?? o.key}
              </option>
            ))}
          </select>
        </label>
      );

    case "number":
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={common}
            placeholder={field.placeholder || ""}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        </label>
      );

    case "date":
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <input
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={common}
          />
        </label>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2 pt-7">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </label>
      );

    case "textarea":
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <textarea
            value={value ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="min-h-[90px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder={field.placeholder || ""}
          />
        </label>
      );

    case "code":
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <pre className="max-h-48 overflow-auto rounded-md border border-slate-200 bg-slate-900 p-3 text-xs text-white">
            <code>{String(value ?? "")}</code>
          </pre>
        </label>
      );

    case "json":
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <pre className="max-h-48 overflow-auto rounded-md border border-slate-200 bg-slate-900 p-3 text-xs text-white">
            <code>
              {typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : String(value ?? "")}
            </code>
          </pre>
        </label>
      );

    default:
      return (
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-600">{label}</span>
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            className={common}
            placeholder={field.placeholder || ""}
          />
        </label>
      );
  }
}

function SimpleTable({ columns, rows }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50">
            {columns.map((c) => (
              <th
                key={c.key}
                className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600"
              >
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className={idx % 2 ? "bg-white" : "bg-slate-50/40"}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="whitespace-nowrap border-b border-slate-100 px-3 py-2 text-slate-800"
                >
                  {String(r?.[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeTables(tab, resData) {
  const tables = tab?.tables?.length
    ? tab.tables
    : tab?.columns?.length
      ? [
          {
            key: "main",
            title: tab.label || "Result",
            columns: tab.columns,
            dataKey: "rows",
          },
        ]
      : [
          {
            key: "main",
            title: tab?.label || "Result",
            columns: [],
            dataKey: "rows",
          },
        ];

  return (tables || []).map((t) => {
    const raw = resData?.[t.dataKey] ?? resData?.rows ?? [];
    const rows = Array.isArray(raw) ? raw : [];

    const cols = t.columns?.length
      ? t.columns
      : rows[0]
        ? Object.keys(rows[0]).map((k) => ({
            key: k,
            title: k.charAt(0).toUpperCase() + k.slice(1),
          }))
        : [];

    return {
      key: t.key || t.dataKey || "table",
      title: t.title || "Table",
      columns: cols.map((c) => ({ key: c.key, title: c.title ?? c.key })),
      rows,
    };
  });
}

export default function IndicesDynamic() {
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [activeGroup, setActiveGroup] = useState("");
  const [activeTab, setActiveTab] = useState("");

  const [stateByKey, setStateByKey] = useState({});

  useEffect(() => {
    let mounted = true;
    setLoadingConfig(true);

    api
      .indicesConfig()
      .then((res) => {
        if (!mounted) return;
        const cfg = res?.data || null;
        setConfig(cfg);

        const g0 = cfg?.groups?.[0]?.key || "";
        const t0 = cfg?.groups?.[0]?.tabs?.[0]?.key || "";

        setActiveGroup((prev) => prev || g0);
        setActiveTab((prev) => prev || t0);
      })
      .catch(() => setConfig(null))
      .finally(() => mounted && setLoadingConfig(false));

    return () => {
      mounted = false;
    };
  }, []);

  const group = useMemo(() => {
    if (!config?.groups?.length) return null;
    return (
      config.groups.find((g) => g.key === activeGroup) ||
      config.groups[0] ||
      null
    );
  }, [config, activeGroup]);

  const tab = useMemo(() => {
    if (!group?.tabs?.length) return null;
    return group.tabs.find((t) => t.key === activeTab) || group.tabs[0] || null;
  }, [group, activeTab]);

  useEffect(() => {
    if (!config?.groups?.length) return;

    setStateByKey((prev) => {
      const next = { ...prev };
      for (const g of config.groups) {
        for (const t of g.tabs || []) {
          const k = `${g.key}:${t.key}`;
          if (!next[k]) {
            next[k] = {
              values: buildDefaultValues(t.fields),
              tables: [],
              loading: false,
              error: "",
              hasRun: false,
            };
          }
        }
      }
      return next;
    });
  }, [config]);

  const screenKey = `${activeGroup}:${activeTab}`;
  const screen = stateByKey[screenKey] || null;

  function setField(key, val) {
    setStateByKey((prev) => ({
      ...prev,
      [screenKey]: {
        ...prev[screenKey],
        values: { ...prev[screenKey].values, [key]: val },
      },
    }));
  }

  function validateRequired(values, fields) {
    for (const f of fields || []) {
      if (!f.required) continue;
      const v = values?.[f.key];
      if (f.type === "checkbox") continue;
      if (v === undefined || v === null || String(v).trim() === "")
        return `${f.label || f.key} is required`;
    }
    return "";
  }

  async function run() {
    if (!tab || !screen) return;

    const err = validateRequired(screen.values, tab.fields);
    if (err) {
      setStateByKey((prev) => ({
        ...prev,
        [screenKey]: { ...prev[screenKey], error: err },
      }));
      return;
    }

    setStateByKey((prev) => ({
      ...prev,
      [screenKey]: { ...prev[screenKey], loading: true, error: "" },
    }));

    try {
      const res = await api.indicesRun(tab.endpoint, screen.values);
      const data = res?.data || {};
      const tables = normalizeTables(tab, data);

      setStateByKey((prev) => ({
        ...prev,
        [screenKey]: {
          ...prev[screenKey],
          loading: false,
          tables,
          hasRun: true,
        },
      }));
    } catch (e) {
      setStateByKey((prev) => ({
        ...prev,
        [screenKey]: {
          ...prev[screenKey],
          loading: false,
          error: e?.message || "Request failed",
          hasRun: true,
          tables: [],
        },
      }));
    }
  }

  useEffect(() => {
    if (loadingConfig) return;
    if (!config?.groups?.length) return;
    if (!tab || !screen || screen.hasRun) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConfig, config, tab, screenKey]);

  const navyBg = { backgroundColor: "rgb(23 37 84 / 1)" };

  const titleTop = useMemo(() => {
    return `${group?.label || "Group"} — ${tab?.label || "Tab"}`;
  }, [group, tab]);

  const totalRows = useMemo(() => {
    return (screen?.tables || []).reduce(
      (acc, t) => acc + (t.rows?.length || 0),
      0,
    );
  }, [screen]);

  function spanClass(f) {
    const n = Math.min(6, Math.max(1, Number(f?.colSpan || 2)));
    return `sm:col-span-${n}`;
  }

  return (
    <div>

        <PageHeader eyebrow="Data analytics" title="Indices" />
             <AnalyticsLayout>
    <div className="bg-slate-100 min-h-screen">
      <div className="p-6">
       

        <div className="mx-auto grid max-w-6xl grid-cols-12 gap-8">
          {/* LEFT */}
          <aside className="col-span-12 lg:col-span-3">
            <div
              className="h-full min-h-[520px] rounded-md shadow-xl"
              style={navyBg}
            >
              <div className="p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Data analytics
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Indices
                </div>

                <div className="mt-4 space-y-2">
                  {(config?.groups || []).map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => {
                        setActiveGroup(g.key);
                        setActiveTab(g.tabs?.[0]?.key || "");
                      }}
                      className={cx(
                        "w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition",
                        g.key === activeGroup
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-white/85 hover:bg-white/15",
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 border-t border-white/15 pt-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                    Tabs
                  </div>
                  <div className="space-y-2">
                    {(group?.tabs || []).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTab(t.key)}
                        className={cx(
                          "w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition",
                          t.key === activeTab
                            ? "bg-white text-slate-900"
                            : "bg-white/10 text-white/85 hover:bg-white/15",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-white/15 pt-4 text-xs text-white/70">
                  {loadingConfig
                    ? "Loading config…"
                    : !config
                      ? "Config failed to load."
                      : config.description}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="col-span-12 lg:col-span-9">
            <div className="grid gap-8">
              {/* FORM */}
              <div className="rounded-md shadow-xl" style={navyBg}>
                <div className="px-6 py-5 text-center text-sm font-semibold text-white">
                  Input and other details
                </div>

                <div className="px-6 pb-6">
                  <div className="rounded-md bg-white p-4 shadow-sm">
                    {!config && !loadingConfig ? (
                      <div className="text-sm text-slate-700">
                        Failed to load config.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                        {(tab?.fields || []).map((f) => (
                          <div key={f.key} className={spanClass(f)}>
                            <Field
                              field={f}
                              value={screen?.values?.[f.key]}
                              onChange={setField}
                              values={screen?.values}
                            />
                          </div>
                        ))}

                        <div className="sm:col-span-6 flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-600">
                            {titleTop}
                          </div>
                          <button
                            type="button"
                            onClick={run}
                            disabled={
                              screen?.loading || loadingConfig || !config
                            }
                            className={cx(
                              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
                              screen?.loading || loadingConfig || !config
                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                : "text-white hover:opacity-95",
                            )}
                            style={
                              screen?.loading || loadingConfig || !config
                                ? undefined
                                : { backgroundColor: "rgb(23 37 84 / 1)" }
                            }
                          >
                            {screen?.loading ? <Spinner /> : null}
                            {screen?.loading ? "Loading..." : "Submit"}
                          </button>
                        </div>

                        {screen?.error ? (
                          <div className="sm:col-span-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {screen.error}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RESULTS */}
              <div className="rounded-md shadow-xl" style={navyBg}>
                <div className="flex items-center justify-between px-6 py-3">
                  <div className="text-sm font-semibold text-white">Result</div>
                  <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    {totalRows} rows
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="rounded-md bg-white shadow-sm">
                    <div className="px-4 py-3 text-xs font-semibold text-slate-600 border-b border-slate-100">
                      {titleTop}
                    </div>

                    <div className="p-3 space-y-6">
                      {!screen?.tables?.length &&
                      screen?.hasRun &&
                      !screen?.loading ? (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                          No results.
                        </div>
                      ) : (
                        (screen?.tables || []).map((t) => (
                          <div
                            key={t.key}
                            className="rounded-md border border-slate-200"
                          >
                            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                              <div className="text-sm font-semibold text-slate-800">
                                {t.title}
                              </div>
                              <div className="text-xs font-semibold text-slate-600">
                                {(t.rows || []).length} rows
                              </div>
                            </div>
                            <div className="p-3">
                              {(t.rows || []).length === 0 ? (
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                  No rows for this table.
                                </div>
                              ) : (
                                <SimpleTable
                                  columns={t.columns}
                                  rows={t.rows}
                                />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
     </AnalyticsLayout>
              </div>
  );
}
