import React from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { Switch } from "@mui/material"; // Import Switch component

const Header = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const { currency, setCurrency, theme, toggleTheme } = CryptoState();

  // console.log(currency);

  const darkTheme = createTheme({
    palette: {
      mode: theme, // Use the theme from context
      primary: {
        main: "#fff", // Set primary color to white
      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar
        sx={{ backgroundColor: theme === "dark" ? "primary" : "#00A550" }}
        position="static"
      >
        <Container>
          <Toolbar>
            <Typography
              onClick={() => navigate("/")}
              style={{
                flex: 1,
                color: theme === "dark" ? "gold" : "white",
                fontFamily: "Montserrat",
                fontWeight: "bold",
                cursor: "pointer",
                variant: "h6",
              }}
            >
              CryptoTrek
            </Typography>
            <Select
              variant="outlined"
              style={{
                width: 100,
                height: 40,
                marginRight: 15,
                backgroundColor: "transparent",
                color: "white",
                border: `1px solid ${theme === "dark" ? "black" : "white"}`,
              }}
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
              }}
            >
              <MenuItem value={"USD"}>USD</MenuItem>
              <MenuItem value={"INR"}>INR</MenuItem>
            </Select>
            {/* Add a toggle switch for theme */}
            <Switch
              checked={theme === "dark"}
              onChange={toggleTheme}
              color="warning"
            />
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
};

export default Header;
