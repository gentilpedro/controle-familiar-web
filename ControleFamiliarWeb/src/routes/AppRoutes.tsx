import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/Layout";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Pessoas from "../pages/Pessoas";
import Categorias from "../pages/Categorias";
import Transacoes from "../pages/Transacoes";
import Relatorios from "../pages/Relatorio";
import Login from "../pages/Login";
import Registrar from "../pages/Registrar";
import MinhaFamilia from "../pages/MinhaFamilia";

export default function AppRoutes() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>

          <Route path="/login" element={<Login />} />

          <Route path="/registrar" element={<Registrar />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >

            <Route index element={<Home />} />

            <Route path="pessoas" element={<Pessoas />} />

            <Route path="categorias" element={<Categorias />} />

            <Route path="transacoes" element={<Transacoes />} />

            <Route path="relatorios" element={<Relatorios />} />

            <Route path="minha-familia" element={<MinhaFamilia />} />

          </Route>

        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}
