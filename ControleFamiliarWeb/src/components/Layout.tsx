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
          <Link className="sidebar-link" to="/">Home</Link>
          <Link className="sidebar-link" to="/pessoas">Pessoas</Link>
          <Link className="sidebar-link" to="/categorias">Categorias</Link>
          <Link className="sidebar-link" to="/transacoes">Transações</Link>
          <Link className="sidebar-link" to="/relatorios">Relatórios</Link>
          <Link className="sidebar-link" to="/minha-familia">Minha Família</Link>
        </nav>

        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{usuario?.nome}</div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14 }}>{familia?.nome}</div>

          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}