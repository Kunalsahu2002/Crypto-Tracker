/**
 * apiService.js  –  Robust CoinGecko fetch layer
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Strategy: Stale-While-Revalidate  (SWR)
 * ─────────────────────────────────────────
 *  1. Check in-memory cache first  (fastest, same-tab)
 *  2. Check localStorage cache     (survives page refreshes & navigation)
 *     a. If FRESH  (< 10 min)  → return immediately, no network call.
 *     b. If STALE  (< 2 hrs)   → return stale data NOW so the page renders,
 *        then silently revalidate in the background.
 *  3. Deduplicate in-flight requests for the same URL (React StrictMode safe).
 *  4. On 429: fall back to stale localStorage data if available, so the user
 *     never sees an error after the first successful load.
 *  5. Optional CoinGecko Demo API key (set VITE_CG_DEMO_KEY in .env).
 *     Free key → 100 calls/min.  Keyless → 5–15 calls/min on a shared IP.
 *     Get your free key at: https://www.coingecko.com/en/api
 */

import axios from 'axios';

// ── API Key (optional but strongly recommended) ───────────────────────────────
const API_KEY = import.meta.env.VITE_CG_DEMO_KEY || '';
const IS_PROD = import.meta.env.PROD;

// Axios instance
const http = axios.create({
  baseURL: IS_PROD ? 'https://api.coingecko.com' : '',
  timeout: 30_000,
});

// Interceptor to attach the API key correctly
http.interceptors.request.use((config) => {
  if (API_KEY) {
    if (IS_PROD) {
      // In production, pass the key as a query parameter to avoid CORS preflight (OPTIONS) header failures
      config.params = {
        ...config.params,
        x_cg_demo_api_key: API_KEY,
      };
    } else {
      // In development, pass as a header (handled/forwarded by the Vite proxy server)
      config.headers['x-cg-demo-api-key'] = API_KEY;
    }
  }
  return config;
});

// ── Cache Config ─────────────────────────────────────────────────────────────
const MEM_TTL_MS  = 5  * 60 * 1000;  // 5 min  – in-memory
const LS_TTL_MS   = 10 * 60 * 1000;  // 10 min – localStorage fresh window
const LS_STALE_MS = 2  * 60 * 60 * 1000; // 2 hrs  – stale-but-usable window

// ── In-memory cache ───────────────────────────────────────────────────────────
const memCache = new Map(); // url → { data, ts }

function memGet(url) {
  const e = memCache.get(url);
  return e && Date.now() - e.ts < MEM_TTL_MS ? e.data : null;
}
function memSet(url, data) {
  memCache.set(url, { data, ts: Date.now() });
}

// ── localStorage cache ────────────────────────────────────────────────────────
function lsKey(url) {
  // btoa gives a safe storage key; slice so we don't overflow key names
  return 'cg_' + btoa(url).slice(0, 80);
}

function lsGet(url) {
  try {
    const raw = localStorage.getItem(lsKey(url));
    if (!raw) return { data: null, fresh: false, stale: false };
    const { data, ts } = JSON.parse(raw);
    const age = Date.now() - ts;
    if (age < LS_TTL_MS)   return { data, fresh: true,  stale: false };
    if (age < LS_STALE_MS) return { data, fresh: false, stale: true  };
    return { data: null, fresh: false, stale: false };
  } catch {
    return { data: null, fresh: false, stale: false };
  }
}

function lsSet(url, data) {
  try {
    localStorage.setItem(lsKey(url), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // QuotaExceededError – silently ignore
  }
}

// ── In-flight deduplication ───────────────────────────────────────────────────
const inFlight = new Map(); // url → Promise<data>

// ── Core network fetch ────────────────────────────────────────────────────────
async function doFetch(url) {
  try {
    const { data } = await http.get(url);
    memSet(url, data);
    lsSet(url, data);
    return data;
  } catch (err) {
    throw err; // caller decides what to do with the error
  } finally {
    inFlight.delete(url);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * fetchAPI(url)
 *
 * Returns data as fast as possible:
 *  - Memory hit   → synchronous-ish (no await overhead)
 *  - Fresh LS hit → microseconds
 *  - Stale LS hit → returns stale data immediately; background-refreshes cache
 *  - No cache     → waits for network; on 429 throws a friendly error
 */
export async function fetchAPI(url) {
  // 1. In-memory (hot path)
  const mem = memGet(url);
  if (mem !== null) return mem;

  // 2. localStorage
  const { data: lsData, fresh, stale } = lsGet(url);

  if (fresh) {
    memSet(url, lsData); // warm memory cache
    return lsData;
  }

  if (stale) {
    // Return stale data NOW so the page renders immediately
    memSet(url, lsData);

    // Revalidate in the background (don't await – fire and forget)
    if (!inFlight.has(url)) {
      const bg = doFetch(url).catch(() => { /* silent – stale data is fine */ });
      inFlight.set(url, bg);
    }

    return lsData;
  }

  // 3. No cache at all – need a real network request
  if (inFlight.has(url)) return inFlight.get(url); // deduplicate

  const promise = doFetch(url).catch((err) => {
    const status = err?.response?.status;

    // 429 Rate limited
    if (status === 429) {
      // Last resort: return stale data if we somehow got some
      const { data: emergencyData } = lsGet(url);
      if (emergencyData) {
        memSet(url, emergencyData);
        return emergencyData;
      }
      throw new Error(
        API_KEY
          ? 'CoinGecko rate limit reached. Please wait a moment and refresh.'
          : 'CoinGecko rate limit reached.\n\nFix: Get a free API key at coingecko.com/en/api and add it to .env as VITE_CG_DEMO_KEY=your_key (100 calls/min free).'
      );
    }

    // Timeout / network errors
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error('Request timed out. Check your connection and try again.');
    }

    throw new Error(err?.message || 'Network error. Check your connection.');
  });

  inFlight.set(url, promise);
  return promise;
}
