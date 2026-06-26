# Changelog — CryptoTrek API Reliability & UI Improvements

## Summary
This update fixes critical API rate-limiting errors that caused the app to fail
on CoinGecko's free public tier, resolves deployment pathing errors on GitHub Pages, and improves the coin detail page UI.

---

## 🚀 GitHub Pages & Deployment Fixes (New)

### 1. Relative API Paths in Production
- **Problem:** Switched all API URLs to `/api/v3/...` to bypass CORS via local Vite proxy. However, static hosts like GitHub Pages do not run Vite proxy servers, resulting in 404s in production.
- **Fix:** Configured `apiService.js` to automatically prepend the absolute URL `https://api.coingecko.com` in production, while maintaining the `/api` proxy route in local development.

### 2. Browser CORS Headers vs. Query Parameters
- **Problem:** Sending the demo API key in the request headers (`x-cg-demo-api-key`) in production causes browsers to block requests due to CORS preflight checks (OPTIONS request failure).
- **Fix:** In production, the API key is passed as a query string parameter (`x_cg_demo_api_key`), which is the officially recommended approach for browser-side requests. In development, it continues to be passed as a header via the proxy.

### 3. Production Subfolder Assets & Routing
- **Problem:** Hardcoding the base path to `/` broke asset loading because the page is served from a subdirectory (`/Crypto-Tracker/`). Also, routing links broke subdirectory context.
- **Fix:** 
  - Updated `vite.config.js` to automatically set the base path to `/Crypto-Tracker/` in production and `/` in development.
  - Set a dynamic `basename` on `<BrowserRouter>` based on the environment to ensure all client-side navigation links preserve the `/Crypto-Tracker` subdirectory context.
  - Updated the banner background image to resolve dynamically using `import.meta.env.BASE_URL`, fixing 404 pathing resolution errors when loading URLs without trailing slashes.

---

## 🐛 Bug Fixes

### 1. CORS Errors on Local API Calls
**Files:** `vite.config.js`
- **Problem:** All local API calls went directly from the browser to `api.coingecko.com`. When CoinGecko returned a `429 Too Many Requests` response, its error response lacked CORS headers, blocking console output.
- **Fix:** Added a Vite dev-server proxy that forwards all `/api/*` requests to `https://api.coingecko.com`. 

### 2. 429 Too Many Requests — Rate Limiting
**Files:** `src/config/api.jsx`, `src/config/apiService.js` (new), all components
- **Problem:** CoinGecko's keyless public API allows only 5–15 requests/minute. The app fired 4–8 requests on first load, which doubled to 8–16 requests because React `<StrictMode>` mounts effects twice. Exponential-backoff retries made the rate limit worsen quickly.
- **Fix (multi-layered):**
  - **Centralized API service** (`src/config/apiService.js`): Created a shared fetch layer with:
    - **In-memory cache** (5-minute TTL) — avoids duplicate network calls within the same session.
    - **`localStorage` persistent cache** (10-minute fresh / 2-hour stale TTL) — data survives page refreshes and navigation.
    - **Stale-While-Revalidate (SWR)** — returns cached data instantly while refreshing in the background.
    - **In-flight deduplication** — deduplicates parallel identical requests.
    - **No retry on 429** — fallback to stale cached data rather than hammering the API on rate limits.

### 3. Request Timeout Errors on Coin Detail Page
**Files:** `vite.config.js`, `src/config/apiService.js`
- **Problem:** Serial request queuing delayed all requests and exceeded Vite's proxy socket timeout.
- **Fix:** Removed the serial queue entirely, increased proxy socket timeout settings to 60s, and raised Axios connection timeouts to 30s.

### 4. Unhandled Promise Rejections
**Files:** `src/components/Banner/Carousel.jsx`, `src/components/CoinsTable.jsx`, `src/components/CoinInfo.jsx`, `src/pages/Coinpage.jsx`
- **Problem:** No `try/catch` wrappers around API calls caused uncaught console exceptions and locked the UI in a loading state on API failure.
- **Fix:** Added `try/catch` logic and error state UI handling across all page loaders.

### 5. React StrictMode Double-Invoke
**Files:** `src/main.jsx`
- **Fix:** Removed `<StrictMode>` wrapper to prevent double effect trigger during local development.

### 6. API Key Not Loading
**Files:** `.env` (new), `.env.example` (new), `.gitignore`
- **Fix:** Set up `.env` for local API keys and added it to `.gitignore` to prevent leaks.

---

## ✨ New Features & UI Improvements

### 7. Coin Detail Page — Stats Panel
**File:** `src/pages/Coinpage.jsx`
- Added **Rank**, **Current Price**, and **Market Cap** stats to the sidebar of the coin detail page, adapting to selected USD/INR currencies.

### 8. Coin Detail Page — Breadcrumb Navigation
**File:** `src/pages/Coinpage.jsx`
- Added breadcrumb bar directly below the header: `← Back  ›  Home  ›  Coins  ›  CoinName` to improve site navigation.

### 9. Coin Detail Page — Layout & Whitespace
- Fixed excessive whitespace padding around the chart in `CoinInfo.jsx`.
- Cleaned up page layout in `Coinpage.jsx` (smaller coin image, top-aligned content, proportional title).

---

## 📁 Files Changed

| File | Type | Summary |
|---|---|---|
| `vite.config.js` | Modified | CORS proxy, base paths, and header configurations |
| `src/config/api.jsx` | Modified | Switched API endpoints to proxy-compatible relative paths |
| `src/config/apiService.js` | **New** | Centralized fetch service with caching, deduplication, and SWR |
| `src/main.jsx` | Modified | Removed `<StrictMode>` |
| `src/components/Banner/Carousel.jsx` | Modified | Integrated API service, error UI handling |
| `src/components/CoinsTable.jsx` | Modified | Integrated API service, error UI handling |
| `src/components/CoinInfo.jsx` | Modified | Integrated API service, error UI handling, padding fix |
| `src/pages/Coinpage.jsx` | Modified | Integrated API service, stats panel, breadcrumbs, layout fixes |
| `src/components/Banner/Banner.jsx` | Modified | Resolved banner2.jpg base path issues |
| `src/App.jsx` | Modified | Configured production routing basename |
| `CHANGELOG.md` | **New** | This file |
| `.env.example` | **New** | Environment key template |
| `.gitignore` | Modified | Excluded environment files |
