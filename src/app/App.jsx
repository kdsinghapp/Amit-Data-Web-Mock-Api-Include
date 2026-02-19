import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Shell from "./layout/Shell.jsx";

// Simple pages
import Home from "./Home.jsx";
import Developers from "./Developers.jsx";
import Placeholder from "./Placeholder.jsx";

// Features
import SubscriptionHome from "../features/subscription/pages/SubscriptionHome.jsx";
import SubscriptionRegions from "../features/subscription/pages/SubscriptionRegions.jsx";
import SubscriptionGeoCoverage from "../features/subscription/pages/SubscriptionGeoCoverage.jsx";
import SubscriptionMarketData from "../features/subscription/pages/SubscriptionMarketData.jsx";
import SubscriptionPlans from "../features/subscription/pages/SubscriptionPlans.jsx";
import SubscriptionProducts from "../features/subscription/pages/SubscriptionProducts.jsx";

import Cart from "../features/checkout/pages/Cart.jsx";
import Checkout from "../features/checkout/pages/Checkout.jsx";
import CheckoutSuccess from "../features/checkout/pages/CheckoutSuccess.jsx";

import MarketEquities from "../features/market/pages/MarketEquities.jsx";
import MarketFutures from "../features/market/pages/MarketFutures.jsx";
import MarketForex from "../features/market/pages/MarketForex.jsx";
import MarketPlaceholder from "../features/market/pages/MarketPlaceholder.jsx";
import MarketOption from "../features/market/pages/MarketOption.jsx";

import GlobalFundamentals from "../features/reference/pages/GlobalFundamentals.jsx";
import CorporateActions from "../features/reference/pages/CorporateActions.jsx";
import TradingSchedules from "../features/reference/pages/TradingSchedules.jsx";

import OptionsAnalytics from "../features/analytics/pages/OptionsAnalytics.jsx";
import GreeksIV from "../features/analytics/pages/GreeksIV.jsx";
import MarketIndicators from "../features/analytics/pages/MarketIndicators.jsx";
import Indices from "../features/analytics/pages/Indices.jsx";

import CoverageUS from "../features/coverage/pages/CoverageUS.jsx";
import CoveragePlaceholder from "../features/coverage/pages/CoveragePlaceholder.jsx";
import SupportPage from "../pages/Support.jsx";
import CompanyPage from "../pages/Company.jsx";

export default function App() {
  return (
    <Shell>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        {/* Subscription builder flow */}
        <Route path="/subscription" element={<SubscriptionHome />} />
        <Route path="/subscription/regions" element={<SubscriptionRegions />} />
        <Route path="/subscription/coverage" element={<SubscriptionGeoCoverage />} />
        <Route path="/subscription/products" element={<SubscriptionProducts  />} />
        <Route path="/subscription/:region/market-data" element={<SubscriptionMarketData />} />
        <Route
          path="/subscription/:region/market-data/:product/plans"
          element={<SubscriptionPlans />}
        />

        {/* Cart / Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />

        {/* Data -> Market */}
        <Route path="/equity" element={<MarketEquities />} />
        <Route path="/forex" element={<MarketForex />} />
        <Route path="/data/market/equities/:regionKey" element={<MarketEquities />} />
        <Route path="/futures" element={<MarketFutures />} />
        <Route path="/data/market/futures/:regionKey" element={<MarketFutures />} />
        <Route path="/options" element={<MarketOption />} />
        <Route path="/data/market/:category" element={<MarketPlaceholder />} />
        <Route path="/data/market/:category/:regionKey" element={<MarketPlaceholder />} />

        {/* Data -> Reference */}
        <Route path="/data/reference/fundamentals" element={<GlobalFundamentals />} />
        <Route path="/data/reference/actions" element={<CorporateActions />} />
        <Route path="/data/reference/schedules" element={<TradingSchedules />} />

        {/* Data -> Analytics */}
        <Route path="/data/analytics/options" element={<OptionsAnalytics />} />
        <Route path="/data/analytics/indices" element={<Indices />} />
        <Route path="/data/analytics/greeks" element={<GreeksIV />} />
        <Route path="/data/analytics/indicators" element={<MarketIndicators />} />

        {/* Data -> Coverage */}
        <Route path="/data/coverage/united-states" element={<CoverageUS />} />
        <Route path="/data/coverage/:region" element={<CoveragePlaceholder />} />

        {/* Top nav placeholders */}
        <Route path="/BusAPI" element={<Developers />} />
        <Route path="/BusProducts" element={<Placeholder />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/data/services" element={<Placeholder />} />
        <Route path="/data/news" element={<Placeholder />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
