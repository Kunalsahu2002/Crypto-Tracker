import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CryptoContext from "./CryptoContext.jsx";
import "react-alice-carousel/lib/alice-carousel.css";
import { useEffect } from "react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CryptoContext>
      {/* Wraps the entire app to provide global state (like currency and symbol) to all components. */}
      <App />
    </CryptoContext>
  </StrictMode>
);
