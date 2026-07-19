import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { usuario, familia, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
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
          <Link className="sidebar-link" to="/painel/assinatura">Assinatura</Link>
        </nav>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{usuario?.nome}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14 }}>{familia?.nome}</div>

          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleLogout}>
            Sair
          </button>

          <Link
            to="/privacidade"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginTop: 14, textAlign: "center", color: "#94a3b8", fontSize: 12 }}
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