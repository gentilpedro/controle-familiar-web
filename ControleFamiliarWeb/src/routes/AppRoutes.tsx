import { BrowserRouter, Routes, Route } from "react-router-dom";

import Pessoas from "../pages/Pessoas";
import Categorias from "../pages/Categorias";
import Transacoes from "../pages/Transacoes";
import Relatorios from "../pages/Relatorios";

export default function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Pessoas />} />

        <Route path="/categorias" element={<Categorias />} />

        <Route path="/transacoes" element={<Transacoes />} />


      </Routes>

    </BrowserRouter>
  );
}