// ==========================================
// MAIN.JSX
// Configuração com Layout Global
// ==========================================

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import App from "./App";
import CronogramaTurma from "./CronogramaTurma";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* Layout envolve todas as páginas */}
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="cronograma" element={<CronogramaTurma />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);