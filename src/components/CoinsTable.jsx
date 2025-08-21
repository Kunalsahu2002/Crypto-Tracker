import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { CoinList } from "../config/api";
import { CryptoState } from "../CryptoContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Container,
  Typography,
  TextField,
  TableContainer,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { numberWithCommas } from "./Banner/Carousel";

const CoinsTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { currency, symbol, theme, toggleTheme } = CryptoState();
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const fetchCoins = async () => {
    setLoading(true);
    const { data } = await axios.get(CoinList(currency));
    setCoins(data);
    setLoading(false);
  };
  // console.log(coins)

  useEffect(() => {
    fetchCoins();
  }, [currency]);

  const darkTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: "#fff",
      },
    },
  });

  const handleSearch = () => {
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search)
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div
        style={{
          backgroundColor: theme === "dark" ? "#14161a" : "#f9f9f9",
          color: theme === "dark" ? "white" : "black",
          minHeight: "100vh",
        }}
      >
        <Container sx={{ textAlign: "center", paddingTop: "20px" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              fontFamily: "Montserrat",
              marginTop: 0,
              marginBottom: 2,
              color: theme === "dark" ? "white" : "#00A550",
            }}
          >
            Cryptocurrency Prices by Market Cap
          </Typography>

          <TextField
            label="Search For a Crypto Currency"
            variant="outlined"
            style={{
              marginBottom: 20,
              width: "50%",
              backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
              borderRadius: "5px",
            }}
            InputLabelProps={{
              style: {
                color: theme === "dark" ? "white" : "black", // Dynamic label color
              },
            }}
            InputProps={{
              style: {
                color: theme === "dark" ? "white" : "black", // Dynamic input text color
              },
            }}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TableContainer>
            {loading ? (
              <LinearProgress
                style={{
                  backgroundColor: theme === "dark" ? "gold" : "#00A550",
                }}
              />
            ) : (
              <Table>
                <TableHead
                  style={{
                    backgroundColor: theme === "dark" ? "gold" : "#00A550",
                  }}
                >
                  <TableRow>
                    {["coin", "price", "24h change", "Market cap"].map(
                      (head) => (
                        <TableCell
                          style={{
                            color: theme === "dark" ? "black" : "white",
                            fontWeight: "700",
                            fontFamily: "Montserrat",
                          }}
                          key={head}
                          align={head === "coin" ? "left" : "right"}
                        >
                          {head}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {handleSearch()
                    .slice((page - 1) * 10, (page - 1) * 10 + 10)
                    .map((row) => {
                      const profit = row.price_change_percentage_24h > 0;
                      return (
                        <TableRow
                          sx={{
                            cursor: "pointer",
                            backgroundColor:
                              theme === "dark" ? "#16171a" : "#f9f9f9",
                            fontFamily: "Montserrat",
                          }}
                          onClick={() => navigate(`/coins/${row.id}`)}
                          key={row.name}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{ display: "flex", gap: 2 }} //gap:15
                          >
                            <img
                              src={row?.image}
                              alt={row.name}
                              height="50"
                              style={{ marginBottom: 10 }}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  textTransform: "uppercase",
                                  fontSize: 22,
                                  color: theme === "dark" ? "white" : "black",
                                }}
                              >
                                {row.symbol}
                              </span>
                              <span
                                style={{
                                  color: theme === "dark" ? "darkgrey" : "grey",
                                }}
                              >
                                {row.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: theme === "dark" ? "white" : "black", // Dynamic text color
                            }}
                          >
                            {symbol}{" "}
                            {numberWithCommas(row.current_price.toFixed(2))}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: profit > 0 ? "rgb(14, 203, 129)" : "red",
                              fontWeight: 500,
                            }}
                          >
                            {profit && "+"}
                            {row.price_change_percentage_24h.toFixed(2)}%
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: theme === "dark" ? "white" : "black", // Dynamic text color
                            }}
                          >
                            {symbol}{" "}
                            {numberWithCommas(
                              row.market_cap.toString().slice(0, -6)
                            )}
                            M
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </TableContainer>
          <Pagination
            sx={{
              padding: 20,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            count={parseInt((handleSearch()?.length / 10).toFixed(0), 10)}
            onChange={(_, value) => {
              setPage(value);
              window.scroll(0, 450);
            }}
          />
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default CoinsTable;
