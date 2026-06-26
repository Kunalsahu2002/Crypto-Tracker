import React from "react";
import { useState, useEffect } from "react";
import { CryptoState } from "../CryptoContext";
import { fetchAPI } from "../config/apiService";
import { createTheme, ThemeProvider } from "@mui/material";
import { HistoricalChart } from "../config/api";
import { Box, CircularProgress } from "@mui/material";
import { Line } from "react-chartjs-2";
import { chartDays } from "../config/data";
import SelectButton from "./SelectButton";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// Register Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState();
  const [days, setDays] = useState(1);
  const [flag, setflag] = useState(false);
  const [error, setError] = useState(null);

  const { currency, theme } = CryptoState();

  const fetchHistoricData = async () => {
    setError(null);
    try {
      const data = await fetchAPI(HistoricalChart(coin.id, days, currency));
      setflag(true);
      setHistoricData(data.prices);
    } catch (err) {
      console.error("CoinInfo chart error:", err.message);
      setError(err.message);
      setflag(false);
    }
  };

  useEffect(() => {
    if (coin) {
      fetchHistoricData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [days, coin]);

  // Dynamically create theme based on the global theme state
  const dynamicTheme = createTheme({
    palette: {
      mode: theme, // Use 'dark' or 'light' based on the global theme
      primary: {
        main: "#fff",
      },
    },
  });

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box
        sx={{
          width: { xs: "100%", md: "70%" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: { xs: "16px", md: "24px 32px" },
        }}
      >
        {error ? (
          <div
            style={{
              color: theme === "dark" ? "gold" : "#c0392b",
              textAlign: "center",
              fontFamily: "Montserrat",
              fontSize: 15,
              padding: "40px 20px",
            }}
          >
            ⚠️ {error}
          </div>
        ) : !historicData ? (
          <CircularProgress
            style={{ color: theme === "dark" ? "gold" : "#00A550" }}
            size={250}
            thickness={1}
          />
        ) : (
          <>
            <Line
              data={{
                labels: historicData.map((coin) => {
                  let date = new Date(coin[0]);
                  let time =
                    date.getHours() > 12
                      ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                      : `${date.getHours()}:${date.getMinutes()} AM`;
                  return days === 1 ? time : date.toLocaleDateString();
                }),
                datasets: [
                  {
                    data: historicData.map((coin) => coin[1]),
                    label: `Price ( Past ${days} Days ) in ${currency}`,
                    borderColor: theme === "light" ? "#00A550" : "gold",
                  },
                ],
              }}
              options={{
                // maintainAspectRatio: false,
                elements: {
                  point: {
                    radius: 1,
                  },
                },
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 20,
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              {chartDays.map((day) => (
                <SelectButton
                  key={day.value}
                  onClick={() => {
                    setDays(day.value);
                    setflag(false);
                  }}
                  selected={day.value === days}
                >
                  {day.label}
                </SelectButton>
              ))}
            </div>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CoinInfo;
