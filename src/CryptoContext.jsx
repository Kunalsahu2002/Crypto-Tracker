import React, { useContext, useState, useEffect } from "react";
import { createContext } from "react";

const Crypto = createContext();
const CryptoContext = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (currency === "INR") setSymbol("₹"); //Tracks the selected currency
    else if (currency === "USD") setSymbol("$"); //Tracks the currency symbol
  }, [currency]);

  // Dynamically update the body class based on the theme
  useEffect(() => {
    document.body.className = theme === "dark" ? "" : "light-mode";
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    //makes currency, symbol, and setCurrency available to all components wrapped by CryptoContext
    <Crypto.Provider
      value={{ currency, symbol, setCurrency, theme, toggleTheme }}
    >
      {children}
    </Crypto.Provider>
  );
};

export default CryptoContext;

//A custom hook to access the context values in any component.
export const CryptoState = () => {
  return useContext(Crypto);
};
