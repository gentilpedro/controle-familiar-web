import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Registrar() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [modoFamilia, setModoFamilia] = useState<"Nova" | "Entrar">("Nova");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeFamilia, setNomeFamilia] = useState("");
  const [codigoConvite, setCodigoConvite] = useState("");

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
      navigate("/");
    } catch {
      setErro("Não foi possível criar a conta. Verifique os dados informados.");
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
          <input
            className="input"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            required
          />

          {modoFamilia === "Nova" ? (
            <input
              className="input"
              placeholder="Nome da família (opcional)"
              value={nomeFamilia}
              onChange={(e) => setNomeFamilia(e.target.value)}
            />
          ) : (
            <input
              className="input"
              placeholder="Código de convite da família"
              value={codigoConvite}
              onChange={(e) => setCodigoConvite(e.target.value.toUpperCase())}
              required
            />
          )}

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
