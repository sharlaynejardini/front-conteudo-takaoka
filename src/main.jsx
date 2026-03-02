import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import ProfessorConteudo from "./ProfessorConteudo";
import CronogramaTurma from "./CronogramaTurma";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import AuthCallback from "./AuthCallback";
import Admin from "./Admin";
import AdminRoute from "./AdminRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* CALLBACK */}
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
          {/* PROVAS (agendamento prova bimestral) */}
          <Route index element={<ProfessorConteudo />} />

          {/* CRONOGRAMA PROVA BIMESTRAL */}
          <Route
            path="cronograma-prova"
            element={<CronogramaTurma />}
          />

          {/* AGENDAMENTO TRABALHO MENSAL */}
          <Route
            path="agendamento-trabalho"
            element={<ProfessorConteudo />}
          />

          {/* CRONOGRAMA TRABALHO MENSAL */}
          <Route
            path="cronograma-trabalho"
            element={<CronogramaTurma />}
          />

          {/* ADMIN */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);