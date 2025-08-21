import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { SingleCoin } from "../config/api";
import axios from "axios";
import CoinInfo from "../components/CoinInfo";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { Typography, LinearProgress } from "@mui/material";
import parse from "html-react-parser";
import numberWithCommas from "../components/Banner/Carousel";

const Coinpage = () => {
  const [coin, setCoin] = useState();
  const { id } = useParams();
  const { currency, symbol, theme, toggleTheme } = CryptoState();

  const fetchCoin = async () => {
    const { data } = await axios.get(SingleCoin(id));
    setCoin(data);
  };

  // console.log(coin);
  useEffect(() => {
    fetchCoin();
  }, [id]);

  // Dynamically create theme based on the global theme state
  const dynamicTheme = createTheme({
    palette: {
      mode: theme, // Use 'dark' or 'light' based on the global theme
    },
  });

  if (!coin)
    return (
      <LinearProgress
        style={{ backgroundColor: theme === "dark" ? "gold" : "#00A550" }}
      />
    );

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column", // Applies for extra-small screens
            md: "row", // Applies for medium screens and above
          },
          alignItems: {
            xs: "center", // Align items to center for extra-small screens
          },
          marginTop: "0px",
          backgroundColor: theme === "dark" ? "#14161a" : "#f9f9f9",
          color: theme === "dark" ? "white" : "black", // Dynamic text color for the entire Box
        }}
      >
        {" "}
        {/* Container */}
        <Box
          sx={{
            width: {
              xs: "100%", // Applies for extra-small screens
              md: "30%", // Applies for medium screens and above
            },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 0, // value was 25
            borderRight: {
              xs: "none", // No border for extra-small screens
              md: theme === "dark" ? "2px solid grey" : "2px solid lightgrey", // Dynamic border color // Border for medium screens and above
            },
          }}
        >
          {/* Sidebar */}
          <img
            src={coin?.image.large}
            alt={coin?.name}
            height="200"
            style={{ marginBottom: 20 }}
          />
          <Typography
            variant="h3"
            style={{
              fontWeight: "bold",
              fontFamily: "Montserrat",
              marginBottom: 20,
              textAlign: "center",
              color: theme === "dark" ? "white" : "black", // Dynamic text color
            }}
          >
            {coin?.name}
          </Typography>
          <Typography
            variant="subtitle1"
            style={{
              width: "100%",
              fontFamily: "Montserrat",
              padding: 25,
              paddingBottom: 15,
              paddingTop: 0,
              textAlign: "justify",
              color: theme === "dark" ? "white" : "black", // Dynamic text color
            }}
          >
            {parse(coin?.description.en.split(". ")[0])}.
          </Typography>{" "}
          {/* Description */}
        </Box>
        <CoinInfo coin={coin} />
      </Box>
    </ThemeProvider>
  );
};

export default Coinpage;
