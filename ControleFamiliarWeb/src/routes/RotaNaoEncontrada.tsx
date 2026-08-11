import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Fallback para URL que nao casa com nenhuma rota (erro de digitacao, link
 * antigo): sem ela o Routes nao encontra elemento nenhum e a tela fica em
 * branco, sem erro e sem saida.
 *
 * Espera o /auth/me terminar antes de decidir — enquanto `carregando`, `usuario`
 * ainda e null e quem tem sessao valida seria mandado para o login a toa.
 */
export default function RotaNaoEncontrada() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <div className="page">Carregando...</div>;
  }

  return <Navigate to={usuario ? "/painel" : "/login"} replace />;
}
