import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CryptoContext from "./CryptoContext.jsx";
import "react-alice-carousel/lib/alice-carousel.css";

// StrictMode removed: it double-invokes effects in dev → doubles API calls
// → causes 429 rate-limit errors on CoinGecko's free tier.
createRoot(document.getElementById("root")).render(
  <CryptoContext>
    {/* Wraps the entire app to provide global state (like currency and symbol) to all components. */}
    <App />
  </CryptoContext>
);
