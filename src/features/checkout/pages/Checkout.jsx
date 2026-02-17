import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../data/cart.jsx";
import { convertFromUSD } from "../../../data/subscriptionData.js";
import { useBillingRegion } from "../../../data/billingRegion.jsx";

function money(value, currency) {
  const v = Number(value || 0);
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "EUR"
        ? "€"
        : currency === "AUD"
          ? "A$"
          : "$";
  return `${symbol}${v.toFixed(0)}`;
}

export default function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const billing = useBillingRegion();
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  const currency = billing.currency || "USD";
  const items = cart.items.map((it) => {
    const baseUSD = Number(it.priceMonthlyUSD ?? it.priceMonthly ?? 0);
    const qty = Number(it.qty || 1);
    const unit = convertFromUSD(baseUSD, currency);
    return { ...it, unitPrice: unit, totalPrice: unit * qty, displayCurrency: currency };
  });
  const subtotal = items.reduce((sum, it) => sum + Number(it.totalPrice || 0), 0);

  function submit(e) {
    e.preventDefault();
    if (cart.items.length === 0) return;
    cart.clear();
    navigate("/checkout/success");
  }

  return (
    <div className="page-surface p-8">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Checkout</div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Place your order</h1>

      {cart.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm text-slate-700">Cart is empty.</div>
          <div className="mt-4">
            <Link className="text-sm font-semibold text-orange-600 hover:text-orange-500" to="/subscription">
              Go to Subscription →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <form onSubmit={submit} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Billing details</div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</div>
                <input
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="you@company.com"
                />
              </label>
              <label className="block sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company</div>
                <input
                  value={form.company}
                  onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="Company name"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/cart"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back to cart
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
              >
                Place order
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Demo checkout (no payment integration). Replace with Stripe/PayPal later.
            </div>
          </form>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-semibold text-slate-900">Order summary</div>
            <div className="mt-4 space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{it.name}</div>
                    <div className="text-xs text-slate-500">Qty {it.qty || 1}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{money(it.totalPrice, currency)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-600">Subtotal</div>
                <div className="font-semibold text-slate-900">{money(subtotal, currency)}</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="text-slate-600">Taxes</div>
                <div className="font-semibold text-slate-900">{money(0, currency)}</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-base">
                <div className="font-semibold text-slate-900">Total</div>
                <div className="font-semibold text-slate-900">{money(subtotal, currency)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
