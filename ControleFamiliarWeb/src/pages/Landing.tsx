import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/landing.css";

/**
 * Lancamentos de exemplo do extrato do hero. Sao ilustrativos — o valor deles
 * e mostrar o formato compartilhado (varias pessoas, um extrato so), nao dados
 * reais. O saldo abaixo e a soma exata destas linhas; se mexer em uma, ajuste.
 */
const LANCAMENTOS = [
  { pessoa: "Ana", descricao: "Salário", valor: 4200 },
  { pessoa: "Léo", descricao: "Mercado", valor: -612.45 },
  { pessoa: "Ana", descricao: "Farmácia", valor: -89.9 },
  { pessoa: "Bruno", descricao: "Freela", valor: 1150 },
  { pessoa: "Léo", descricao: "Escola da Sofia", valor: -980 },
];

const SALDO = LANCAMENTOS.reduce((total, l) => total + l.valor, 0);

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Icones desenhados em traco fino, no mesmo peso das pautas do extrato. */
function IconeFamilia() {
  return (
    <svg className="lp-recurso-icone" width="26" height="26" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2" />
      <path d="M17.5 14.9c1.9.6 3 2.4 3 4.6" />
    </svg>
  );
}

function IconeLancamentos() {
  return (
    <svg className="lp-recurso-icone" width="26" height="26" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13.5L12 17l-6.5 2.5V6A1.5 1.5 0 0 1 7 4.5Z" />
      <path d="M9.5 9h5" />
      <path d="M12 6.5v5" />
    </svg>
  );
}

function IconeRelatorios() {
  return (
    <svg className="lp-recurso-icone" width="26" height="26" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5h16" />
      <path d="M7 19.5v-6" />
      <path d="M12 19.5V7" />
      <path d="M17 19.5v-9" />
    </svg>
  );
}

function MarcaFiscalHub() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4"
        stroke="#1f7a4c" strokeWidth="1.6" />
      <path d="M7 9h10M7 12.5h10M7 16h6"
        stroke="#1f7a4c" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Landing() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;

  // Quem já está logado não precisa ver a landing page de novo — manda
  // direto pro painel, inclusive em quem chega aqui por um link salvo.
  if (usuario) return <Navigate to="/painel" replace />;

  return (
    <div className="lp">
      <header className="lp-nav">
        <div className="lp-marca">
          <MarcaFiscalHub />
          FiscalHub
        </div>

        <nav className="lp-nav-links">
          <Link to="/login" className="lp-botao-discreto">Entrar</Link>
          <Link to="/registrar" className="lp-botao lp-botao-solido">Criar conta</Link>
        </nav>
      </header>

      <section className="lp-hero">
        <div>
          <p className="lp-sobrancelha">Receitas · Despesas · Saldo</p>

          <h1>O dinheiro da casa, num extrato só.</h1>

          <p className="lp-hero-sub">
            Cada pessoa lança o que entrou e o que saiu. Todo mundo vê o mesmo extrato,
            o mesmo saldo e os mesmos relatórios — sem planilha indo e voltando por
            mensagem.
          </p>

          <div className="lp-hero-acoes">
            <Link to="/registrar" className="lp-botao lp-botao-solido">Criar conta</Link>
            <Link to="/login" className="lp-botao lp-botao-vazado">Já tenho conta</Link>
          </div>

          <p className="lp-nota-hero">
            Grátis para usar. Crie a conta, convide quem mora com você e comece a
            lançar — sem cartão de crédito.
          </p>
        </div>

        {/*
          Dados de exemplo. role="img" + aria-label descrevem o bloco inteiro em
          vez de fazer o leitor de tela percorrer cifras que não são do usuário.
        */}
        <div
          className="lp-extrato"
          role="img"
          aria-label="Exemplo de extrato compartilhado: lançamentos de Ana, Léo e Bruno somando um saldo de R$ 3.667,65 no mês."
        >
          <div className="lp-extrato-topo">
            <span className="lp-extrato-titulo">Extrato da família</span>
            <span className="lp-extrato-mes">Março</span>
          </div>

          {LANCAMENTOS.map((lancamento, indice) => (
            <div
              key={`${lancamento.pessoa}-${lancamento.descricao}`}
              className="lp-linha lp-revela"
              style={{ animationDelay: `${140 + indice * 90}ms` }}
            >
              <span className="lp-linha-quem">
                <span className="lp-pessoa">{lancamento.pessoa}</span>
                <span className="lp-descricao">{lancamento.descricao}</span>
              </span>

              <span
                className={
                  lancamento.valor >= 0
                    ? "lp-valor lp-valor-credito"
                    : "lp-valor lp-valor-debito"
                }
              >
                {lancamento.valor >= 0 ? "+" : "−"}
                {moeda.format(Math.abs(lancamento.valor))}
              </span>
            </div>
          ))}

          <div
            className="lp-saldo lp-revela"
            style={{ animationDelay: `${140 + LANCAMENTOS.length * 90}ms` }}
          >
            <span className="lp-saldo-rotulo">Saldo do mês</span>
            <span className="lp-saldo-valor">{moeda.format(SALDO)}</span>
          </div>
        </div>
      </section>

      <section className="lp-recursos">
        <div className="lp-recursos-topo">
          <h2>Feito para dinheiro que é de mais de uma pessoa</h2>
          <p>
            O que numa planilha vira cópia desencontrada, aqui é um lançamento só,
            visível para a família inteira.
          </p>
        </div>

        <div className="lp-recursos-grade">
          <article className="lp-recurso">
            <IconeFamilia />
            <h3>Uma conta, a família toda</h3>
            <p>
              Convide quem mora com você por e-mail ou código. A partir daí, as mesmas
              pessoas, categorias e transações valem para todo mundo.
            </p>
          </article>

          <article className="lp-recurso">
            <IconeLancamentos />
            <h3>Cada lançamento no lugar</h3>
            <p>
              Registre receitas e despesas por pessoa e por categoria, com regra
              própria para dependentes menores de idade.
            </p>
          </article>

          <article className="lp-recurso">
            <IconeRelatorios />
            <h3>Relatórios que fecham</h3>
            <p>
              Saldo, receitas e despesas por pessoa e por categoria, em gráficos. Exporte
              em Excel quando precisar.
            </p>
          </article>
        </div>
      </section>

      <section className="lp-chamada-faixa">
        <div className="lp-chamada">
          <h2>Comece o extrato da sua casa</h2>
          <p>
            Crie a conta, convide quem mora com você e registre o primeiro lançamento
            em poucos minutos.
          </p>

          <Link to="/registrar" className="lp-botao lp-botao-solido">
            Criar minha conta
          </Link>

          <p className="lp-chamada-nota">
            Use sozinho ou compartilhe com a família — sem custo.
          </p>
        </div>
      </section>

      <footer className="lp-rodape">
        <div className="lp-rodape-interno">
          <Link to="/privacidade">Política de Privacidade</Link>
          <p className="lp-rodape-copy">© 2026 FiscalHub</p>
        </div>
      </footer>
    </div>
  );
}
