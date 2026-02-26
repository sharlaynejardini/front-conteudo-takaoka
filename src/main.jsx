import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import ProfessorConteudo from "./ProfessorConteudo";
import CronogramaTurma from "./CronogramaTurma";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import AuthCallback from "./AuthCallback";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* CALLBACK DO SUPABASE */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ROTAS PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfessorConteudo />} />
          <Route path="cronograma" element={<CronogramaTurma />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);