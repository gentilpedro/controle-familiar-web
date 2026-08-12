import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { usuario, familia, logout } = useAuth();
  const navigate = useNavigate();

  // Só tem efeito abaixo de 768px: no desktop o CSS mostra o menu sempre,
  // independente deste estado.
  const [menuAberto, setMenuAberto] = useState(false);

  async function handleLogout() {
    // Espera a API apagar o cookie antes de navegar: sair da tela primeiro
    // deixaria a sessão viva no servidor até o token expirar.
    await logout();
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-topo">
          <div className="sidebar-title">Financeiro</div>

          <button
            type="button"
            className="sidebar-menu-botao"
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            {menuAberto ? "Fechar" : "Menu"}
          </button>
        </div>

        <div
          id="menu-principal"
          className={menuAberto ? "sidebar-recolhivel aberto" : "sidebar-recolhivel"}
        >
          {/*
            Fecha no clique em qualquer link: a alternativa seria um efeito
            reagindo à rota, e efeito que só mexe em estado local é justamente
            o que a gente tirou daqui antes.
          */}
          <nav className="sidebar-nav" onClick={() => setMenuAberto(false)}>
            <Link className="sidebar-link" to="/painel">Home</Link>
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
        </div>
      </aside>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}