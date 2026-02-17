import React from "react";
import PageHeader from "../components/PageHeader.jsx";

export default function Developers() {
  return (
    <div>
      <PageHeader
        eyebrow="Developers"
        title="Developers"
        subtitle="Find technical details about accessing our data services and stay updated with the latest news."
      />

      <div className="page-surface p-6">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="dark-panel rounded-2xl p-6">
              <div className="text-lg font-semibold">Developers</div>
              <p className="mt-2 text-sm text-slate-300/85">
                Find technical details about accessing our data services and stay updated with the latest news.
              </p>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="dark-panel rounded-2xl p-4">
              <div className="space-y-1">
                {[
                  { label: "APIs" },
                  { label: "Knowledge Base" },
                  { label: "Announcements" },
                  { label: "Demo" },
                ].map((x) => (
                  <a key={x.label} href="#" className="dark-item">
                    <span className={x.label === "APIs" ? "text-orange-400" : ""}>{x.label}</span>
                    <span className="text-slate-300/45">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
