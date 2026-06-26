import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { SingleCoin } from "../config/api";
import { fetchAPI } from "../config/apiService";
import CoinInfo from "../components/CoinInfo";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Typography, LinearProgress } from "@mui/material";
import parse from "html-react-parser";
import { numberWithCommas } from "../components/Banner/Carousel";

const Coinpage = () => {
  const [coin, setCoin] = useState();
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, symbol, theme } = CryptoState();

  const fetchCoin = async () => {
    setError(null);
    try {
      const data = await fetchAPI(SingleCoin(id));
      setCoin(data);
    } catch (err) {
      console.error("Coinpage fetch error:", err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCoin();
  }, [id]);

  const dynamicTheme = createTheme({
    palette: { mode: theme },
  });

  const isDark = theme === "dark";
  const textColor = isDark ? "white" : "black";
  const accentColor = isDark ? "gold" : "#00A550";
  const bg = isDark ? "#14161a" : "#f9f9f9";
  const borderColor = isDark ? "2px solid grey" : "2px solid lightgrey";

  if (error)
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          color: isDark ? "gold" : "#c0392b",
          fontFamily: "Montserrat",
          fontSize: 16,
          backgroundColor: bg,
          minHeight: "100vh",
        }}
      >
        ⚠️ {error}
      </div>
    );

  if (!coin)
    return (
      <LinearProgress style={{ backgroundColor: accentColor }} />
    );

  // Stat row helper
  const Stat = ({ label, value }) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
      <span
        style={{
          fontFamily: "Montserrat",
          fontWeight: 700,
          fontSize: 16,
          color: textColor,
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontFamily: "Montserrat",
          fontWeight: 400,
          fontSize: 16,
          color: textColor,
        }}
      >
        {value}
      </span>
    </div>
  );

  const currentPrice = coin?.market_data?.current_price[currency.toLowerCase()];
  const marketCap    = coin?.market_data?.market_cap[currency.toLowerCase()];
  const rank         = coin?.market_cap_rank;

  return (
    <ThemeProvider theme={dynamicTheme}>
      {/* ── Breadcrumb / Back bar ──────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: { xs: 2, md: 4 },
          py: 1.2,
          backgroundColor: isDark ? "#0d0f12" : "#eef0ee",
          borderBottom: isDark ? "1px solid #2a2d33" : "1px solid #d4d4d4",
          fontFamily: "Montserrat",
          fontSize: 13,
        }}
      >
        {/* Back arrow button */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: accentColor,
            fontFamily: "Montserrat",
            fontWeight: 600,
            fontSize: 13,
            padding: "4px 10px 4px 4px",
            borderRadius: 6,
            transition: "background 0.18s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = isDark
              ? "rgba(255,215,0,0.08)"
              : "rgba(0,165,80,0.08)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "none")
          }
        >
          {/* Left arrow SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* Breadcrumb trail */}
        <span style={{ color: isDark ? "#888" : "#999", userSelect: "none" }}>›</span>
        <span
          style={{ color: isDark ? "#aaa" : "#666", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Home
        </span>
        <span style={{ color: isDark ? "#888" : "#999", userSelect: "none" }}>›</span>
        <span style={{ color: isDark ? "#aaa" : "#666", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Coins
        </span>
        <span style={{ color: isDark ? "#888" : "#999", userSelect: "none" }}>›</span>
        <span style={{ color: textColor, fontWeight: 600 }}>
          {coin?.name}
        </span>
      </Box>

      {/* ── Main content ───────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "flex-start" },
          backgroundColor: bg,
          color: textColor,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* ── Sidebar ──────────────────────────────────────────── */}
        <Box
          sx={{
            width: { xs: "100%", md: "30%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px 20px",
            borderRight: { xs: "none", md: borderColor },
            borderBottom: { xs: borderColor, md: "none" },
          }}
        >
          <img
            src={coin?.image?.large}
            alt={coin?.name}
            height="150"
            style={{ marginBottom: 16 }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "Montserrat",
              mb: 1.5,
              textAlign: "center",
              color: textColor,
            }}
          >
            {coin?.name}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: "Montserrat",
              textAlign: "justify",
              color: textColor,
              mb: 2.5,
              lineHeight: 1.6,
              fontSize: "0.85rem",
            }}
          >
            {coin?.description?.en
              ? parse(coin.description.en.split(". ")[0] + ".")
              : ""}
          </Typography>

          {/* ── Stats ─────────────────────────────────────── */}
          <Box sx={{ width: "100%", mt: 0.5 }}>
            <Stat label="Rank"          value={`#${rank}`} />
            <Stat
              label="Current Price"
              value={`${symbol} ${numberWithCommas(currentPrice?.toFixed(2) ?? "—")}`}
            />
            <Stat
              label="Market Cap"
              value={`${symbol} ${numberWithCommas(
                marketCap?.toString().slice(0, -6) ?? "—"
              )}M`}
            />
          </Box>
        </Box>

        {/* ── Chart (CoinInfo) ─────────────────────────────────── */}
        <CoinInfo coin={coin} />
      </Box>
    </ThemeProvider>
  );
};

export default Coinpage;
