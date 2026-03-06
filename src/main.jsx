import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import ProfessorConteudo from "./ProfessorConteudo";
import CronogramaTurma from "./CronogramaTurma";
import ProfessorTrabalho from "./ProfessorTrabalho";
import CronogramaTrabalho from "./CronogramaTrabalho";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import AuthCallback from "./AuthCallback";
import Admin from "./Admin";
import AdminRoute from "./AdminRoute";
import TestAPI from "./TestAPI";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* CALLBACK */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* TESTE API */}
        <Route path="/test-api" element={<TestAPI />} />

        {/* ROTAS PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* PROVAS BIMESTRAIS */}
          <Route index element={<ProfessorConteudo />} />
          <Route path="cronograma" element={<CronogramaTurma />} />

          {/* TRABALHOS MENSAIS */}
          <Route path="trabalho" element={<ProfessorTrabalho />} />
          <Route path="cronograma-trabalho" element={<CronogramaTrabalho />} />

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