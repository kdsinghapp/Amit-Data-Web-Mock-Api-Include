import React from "react";

export default function Table({ columns, rows, caption }) {
  return (
    <div className="page-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="text-sm font-semibold text-slate-900">{caption}</div>
        <div className="text-xs text-slate-500 mt-1">Live Sample (mock)</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-5 py-3 text-left text-xs font-semibold text-slate-600">
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3 text-slate-800">
                    {r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
