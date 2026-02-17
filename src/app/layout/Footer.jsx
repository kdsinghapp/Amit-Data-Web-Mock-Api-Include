import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">D</span>
            <span>Data Platform UI</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a className="hover:text-slate-900" href="#">Terms</a>
            <a className="hover:text-slate-900" href="#">Privacy</a>
            <a className="hover:text-slate-900" href="#">Status</a>
            <a className="hover:text-slate-900" href="#">Changelog</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
