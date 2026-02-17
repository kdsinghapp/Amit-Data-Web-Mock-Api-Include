import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App.jsx";
import { CartProvider } from "./data/cart.jsx";
import { BillingRegionProvider } from "./data/billingRegion.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BillingRegionProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </BillingRegionProvider>
    </BrowserRouter>
  </React.StrictMode>
);
