import React from "react";

const SelectButton = ({ children, selected, onClick, theme }) => {
  return (
    <span
      onClick={onClick}
      style={{
        border: `1px solid ${theme === "dark" ? "gold" : "white"}`,
        borderRadius: 5,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: "Montserrat",
        cursor: "pointer",
        backgroundColor: selected
          ? theme === "dark"
            ? "gold"
            : "#00A550"
          : "",
        color: selected ? (theme === "dark" ? "black" : "white") : "",
        fontWeight: selected ? 700 : 500,
        "&:hover": {
          backgroundColor: theme === "dark" ? "gold" : "#00A550",
          color: theme === "dark" ? "black" : "white",
        },
        width: "22%",
        //   margin: 5,
      }}
    >
      {children}
    </span>
  );
};

export default SelectButton;
