import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { mensagemDeErro } from "../utils/erro";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await login({ email, senha });
      navigate("/painel");
    } catch (erro) {
      // A API distingue "credencial errada" de "conta bloqueada por excesso de
      // tentativas" e de "muitas requisições" (429). Engolir tudo num
      // "Email ou senha inválidos" fixo fazia quem estava só bloqueado achar
      // que errou a senha — e continuar tentando, o que renovava o bloqueio.
      setErro(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-subtitle">Acesse o Controle Financeiro.</p>

        {erro && <div className="auth-error">{erro}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="sr-only" htmlFor="login-senha">Senha</label>
          <input
            id="login-senha"
            className="input"
            type="password"
            placeholder="Senha"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button className="btn btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          Ainda não tem conta? <Link to="/registrar">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
