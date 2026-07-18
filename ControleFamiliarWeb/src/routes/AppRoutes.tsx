import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/Layout";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const Pessoas = lazy(() => import("../pages/Pessoas"));
const Categorias = lazy(() => import("../pages/Categorias"));
const Transacoes = lazy(() => import("../pages/Transacoes"));
const Relatorios = lazy(() => import("../pages/Relatorio"));
const Login = lazy(() => import("../pages/Login"));
const Registrar = lazy(() => import("../pages/Registrar"));
const MinhaFamilia = lazy(() => import("../pages/MinhaFamilia"));
const Privacidade = lazy(() => import("../pages/Privacidade"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="page">Carregando...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/registrar" element={<Registrar />} />

            <Route path="/privacidade" element={<Privacidade />} />

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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
