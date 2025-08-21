import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Homepage from "./pages/Homepage";
import Coinpage from "./pages/Coinpage";
import "./App.css";

//The app.jsx file which contains the layout of the website

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          backgroundColor: "#14161a",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />{" "}
          {/*  Renders the Homepage component */}
          <Route path="/coins/:id" element={<Coinpage />} />{" "}
          {/*  Renders the Coinpage component when navigating to specific cryptocurrency. */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
