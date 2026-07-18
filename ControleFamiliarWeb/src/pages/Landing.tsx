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
        <div className="landing-brand">
          <span className="landing-logo">💳</span>
          FiscalHub
        </div>

        <nav className="landing-nav-links">
          <Link to="/login" className="landing-link">Entrar</Link>
          <Link to="/registrar" className="btn btn-primary">Criar conta</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-text">
          <span className="landing-badge">
            <span className="landing-badge-dot" />
            Novo: Gestão Compartilhada
          </span>

          <h1>FiscalHub: controle financeiro simples para famílias e indivíduos</h1>

          <p>
            Registre receitas e despesas, acompanhe relatórios com gráficos e compartilhe os
            mesmos dados com quem mora com você — tudo em uma única conta por família.
          </p>

          <div className="landing-hero-actions">
            <Link to="/registrar" className="btn btn-primary">Começar agora, é grátis →</Link>
            <Link to="/login" className="btn btn-secondary">Já tenho conta</Link>
          </div>

          <ul className="landing-checklist">
            <li>✓ Sem necessidade de cartão de crédito</li>
            <li>✓ Seus dados protegidos, nunca compartilhados com terceiros</li>
          </ul>
        </div>

        <div className="landing-hero-art">
          <div className="landing-art-card">
            <span className="landing-art-emoji landing-art-emoji-1">👨‍👩‍👧‍👦</span>
            <span className="landing-art-emoji landing-art-emoji-2">💰</span>
            <span className="landing-art-emoji landing-art-emoji-3">📈</span>
            <span className="landing-art-emoji landing-art-emoji-4">🐷</span>
          </div>
        </div>
      </section>

      <section className="landing-features-section">
        <div className="landing-features-header">
          <h2>Tudo o que você precisa para organizar as finanças</h2>
          <p>
            Ferramentas pensadas para simplificar a vida financeira da sua família, sem a
            complexidade das planilhas tradicionais.
          </p>
        </div>

        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-1">👥</div>
            <h3>Uma conta, a família toda</h3>
            <p>
              Convide quem mora com você por e-mail ou código de convite — todos passam a
              compartilhar as mesmas pessoas, categorias e transações, sem dividir planilhas.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-2">💰</div>
            <h3>Receitas e despesas organizadas</h3>
            <p>
              Cadastre transações por pessoa e por categoria, com regras específicas para
              dependentes menores de idade.
            </p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon-3">📊</div>
            <h3>Relatórios com gráficos</h3>
            <p>
              Acompanhe o saldo, receitas e despesas por pessoa e por categoria — e exporte
              tudo em Excel quando precisar.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-cta-wrapper">
        <div className="landing-cta">
          <h2>Pronto para organizar as finanças da sua família?</h2>
          <p>
            Comece a registrar receitas e despesas em poucos minutos, sozinho ou com quem mora
            com você.
          </p>

          <div className="landing-cta-actions">
            <Link to="/registrar" className="btn landing-cta-button">Criar minha conta gratuita</Link>
            <span className="landing-cta-note">Grátis, sem cartão de crédito.</span>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-links">
          <Link to="/privacidade">Política de Privacidade</Link>
        </div>
        <p className="landing-footer-copy">© 2026 FiscalHub. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
