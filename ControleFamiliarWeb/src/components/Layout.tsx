import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { usuario, familia, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    // Espera a API apagar o cookie antes de navegar: sair da tela primeiro
    // deixaria a sessão viva no servidor até o token expirar.
    await logout();
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-title">Financeiro</div>

        <nav className="sidebar-nav">
          <Link className="sidebar-link" to="/painel">Home</Link>
          <Link className="sidebar-link" to="/painel/pessoas">Pessoas</Link>
          <Link className="sidebar-link" to="/painel/categorias">Categorias</Link>
          <Link className="sidebar-link" to="/painel/transacoes">Transações</Link>
          <Link className="sidebar-link" to="/painel/relatorios">Relatórios</Link>
          <Link className="sidebar-link" to="/painel/minha-familia">Minha Família</Link>
          <Link className="sidebar-link" to="/painel/meus-dados">Meus Dados</Link>
        </nav>

        <div className="sidebar-rodape">
          <div className="sidebar-usuario">{usuario?.nome}</div>
          <div className="sidebar-familia">{familia?.nome}</div>

          <button className="btn btn-secondary sidebar-sair" onClick={handleLogout}>
            Sair
          </button>

          <Link
            to="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-privacidade"
          >
            Política de Privacidade
          </Link>
        </div>
      </aside>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}