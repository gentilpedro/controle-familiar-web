import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { mensagemDeErro } from "../utils/erro";

export default function Registrar() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codigoDaUrl = searchParams.get("codigo") ?? "";

  const [modoFamilia, setModoFamilia] = useState<"Nova" | "Entrar">(codigoDaUrl ? "Entrar" : "Nova");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeFamilia, setNomeFamilia] = useState("");
  const [codigoConvite, setCodigoConvite] = useState(codigoDaUrl);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);

  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await registrar({
        nome,
        email,
        senha,
        modoFamilia,
        nomeFamilia: modoFamilia === "Nova" ? nomeFamilia : undefined,
        codigoConvite: modoFamilia === "Entrar" ? codigoConvite : undefined
      });
      navigate("/painel");
    } catch (erro) {
      // A API já explica o motivo real: e-mail em uso, senha fora da política,
      // código de convite inválido. A mensagem fixa apagava tudo isso.
      setErro(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">
          Use sozinho ou compartilhe os dados com sua família.
        </p>

        <div className="auth-toggle">
          <button
            type="button"
            className={modoFamilia === "Nova" ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setModoFamilia("Nova")}
          >
            Uso individual
          </button>
          <button
            type="button"
            className={modoFamilia === "Entrar" ? "btn btn-primary" : "btn btn-secondary"}
            onClick={() => setModoFamilia("Entrar")}
          >
            Entrar em família
          </button>
        </div>

        {erro && <div className="auth-error">{erro}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="registrar-nome">Seu nome</label>
          <input
            id="registrar-nome"
            className="input"
            placeholder="Seu nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label className="sr-only" htmlFor="registrar-email">Email</label>
          <input
            id="registrar-email"
            className="input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="sr-only" htmlFor="registrar-senha">Senha (mínimo 8 caracteres)</label>
          <input
            id="registrar-senha"
            className="input"
            type="password"
            placeholder="Senha (mínimo 8 caracteres)"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={8}
            required
          />

          {modoFamilia === "Nova" ? (
            <>
              <label className="sr-only" htmlFor="registrar-nome-familia">Nome da família (opcional)</label>
              <input
                id="registrar-nome-familia"
                className="input"
                placeholder="Nome da família (opcional)"
                value={nomeFamilia}
                onChange={(e) => setNomeFamilia(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="sr-only" htmlFor="registrar-codigo-convite">Código de convite da família</label>
              <input
                id="registrar-codigo-convite"
                className="input"
                placeholder="Código de convite da família"
                value={codigoConvite}
                onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
                required
              />
            </>
          )}

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={aceitouPrivacidade}
              onChange={(e) => setAceitouPrivacidade(e.target.checked)}
              required
            />
            Li e concordo com a{" "}
            <Link to="/privacidade" target="_blank" rel="noopener noreferrer">
              Política de Privacidade
            </Link>
          </label>

          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
