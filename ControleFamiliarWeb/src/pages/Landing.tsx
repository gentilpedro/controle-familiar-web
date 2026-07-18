import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Landing() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;

  // Quem já está logado não precisa ver a landing page de novo — manda
  // direto pro painel, inclusive em quem chega aqui por um link salvo.
  if (usuario) return <Navigate to="/painel" replace />;

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-brand">Controle Financeiro</div>

        <nav className="landing-nav-links">
          <Link to="/login" className="btn btn-secondary">Entrar</Link>
          <Link to="/registrar" className="btn btn-primary">Criar conta</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <h1>Organize as finanças da sua família em um só lugar</h1>
        <p>
          Registre receitas e despesas, acompanhe relatórios com gráficos e compartilhe os
          mesmos dados com quem mora com você — tudo em uma única conta por família.
        </p>

        <div className="landing-hero-actions">
          <Link to="/registrar" className="btn btn-primary">Começar agora, é grátis</Link>
          <Link to="/login" className="btn btn-secondary">Já tenho conta</Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="card">
          <div className="landing-feature-icon">👥</div>
          <h2 className="section-title">Uma conta, a família toda</h2>
          <p className="page-subtitle">
            Convide quem mora com você por e-mail ou código de convite — todos passam a
            compartilhar as mesmas pessoas, categorias e transações, sem dividir planilhas.
          </p>
        </div>

        <div className="card">
          <div className="landing-feature-icon">💰</div>
          <h2 className="section-title">Receitas e despesas organizadas</h2>
          <p className="page-subtitle">
            Cadastre transações por pessoa e por categoria, com regras específicas para
            dependentes menores de idade.
          </p>
        </div>

        <div className="card">
          <div className="landing-feature-icon">📊</div>
          <h2 className="section-title">Relatórios com gráficos</h2>
          <p className="page-subtitle">
            Acompanhe o saldo, receitas e despesas por pessoa e por categoria — e exporte tudo
            em Excel quando precisar.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <Link to="/privacidade">Política de Privacidade</Link>
      </footer>
    </div>
  );
}
