import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../data/cart.jsx";
import { productLabel, regionLabel } from "../../../data/subscriptionData.js";
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

export default function Cart() {
  const cart = useCart();
  const navigate = useNavigate();
  const billing = useBillingRegion();

  const currency = billing.currency || "USD";

  const displayItems = cart.items.map((it) => {
    const baseUSD = Number(it.priceMonthlyUSD ?? it.priceMonthly ?? 0);
    const unit = convertFromUSD(baseUSD, currency);
    const qty = Number(it.qty || 1);
    return {
      ...it,
      displayCurrency: currency,
      unitPrice: unit,
      totalPrice: unit * qty,
    };
  });

  const subtotal = displayItems.reduce((sum, it) => sum + Number(it.totalPrice || 0), 0);

  return (
    <div className="page-surface p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cart</div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Your selected plans</h1>
          <p className="mt-2 text-sm text-slate-600">Review items, adjust quantities, then checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => cart.clear()}
          disabled={cart.items.length === 0}
          className={
            cart.items.length === 0
              ? "rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
              : "rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          }
        >
          Clear
        </button>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="text-sm text-slate-700">Cart is empty.</div>
          <div className="mt-4">
            <Link className="text-sm font-semibold text-orange-600 hover:text-orange-500" to="/subscription">
              Go to Subscription →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Item</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Region</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Product</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Price</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Qty</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
                  <th className="px-4 py-3 font-semibold text-slate-700"></th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((it) => (
                  <tr key={it.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{it.name}</div>
                      <div className="text-xs text-slate-500">{it.displayCurrency} / month</div>
                    </td>
                    <td className="px-4 py-3">{regionLabel(it.region)}</td>
                    <td className="px-4 py-3">{productLabel(it.product)}</td>
                    <td className="px-4 py-3">{money(it.unitPrice, it.displayCurrency)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={it.qty || 1}
                        onChange={(e) => cart.setQty(it.id, e.target.value)}
                        className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{money(it.totalPrice, it.displayCurrency)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => cart.remove(it.id)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-slate-600">Subtotal</div>
              <div className="text-2xl font-semibold text-slate-900">{money(subtotal, currency)}</div>
              <div className="text-xs text-slate-500">Taxes not included</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/subscription/regions"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Continue shopping
              </Link>
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
