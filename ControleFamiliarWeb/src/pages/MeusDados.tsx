import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import { mensagemDeErro } from "../utils/erro";
import Modal from "../components/Modal";
import type { ApiEnvelope, ExportacaoDados, MeResponse } from "../types/Auth";

export default function MeusDados() {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();

    limparMensagens();
    setSalvando(true);

    try {
      const response = await api.patch<ApiEnvelope<MeResponse>>("/auth/me", { nome, email });
      atualizarUsuario(response.data.data!.usuario);
      setSucesso("Dados atualizados com sucesso.");
    } catch (erro) {
      setErro(mensagemDeErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  async function baixarDados() {
    limparMensagens();
    setExportando(true);

    try {
      const response = await api.get<ApiEnvelope<ExportacaoDados>>("/auth/exportar-dados");

      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "meus-dados.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (erro) {
      setErro(mensagemDeErro(erro));
    } finally {
      setExportando(false);
    }
  }

  async function confirmarExclusao() {
    setErro("");
    setExcluindo(true);

    try {
      await api.delete("/auth/me");
      logout();
      navigate("/login");
    } catch (erro) {
      setErro(mensagemDeErro(erro));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Meus Dados</h1>
          <p className="page-subtitle">Gerencie seus dados pessoais, exporte-os ou exclua sua conta.</p>
        </div>
      </div>

      {erro && <div className="auth-error">{erro}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      <div className="card">
        <h2 className="section-title">Perfil</h2>
        <form onSubmit={salvarPerfil} className="form-row pessoas">
          <input
            className="input"
            placeholder="Nome"
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

          <button className="btn btn-primary" type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </form>

        <p style={{ color: "var(--tinta-suave)", fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          Alterar o e-mail exige confirmar o novo endereço — você recebe um novo e-mail de confirmação.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Baixar meus dados</h2>
        <p className="page-subtitle">
          Baixe uma cópia de tudo que tratamos em seu nome: seu perfil, sua família e todas as pessoas,
          categorias e transações compartilhadas.
        </p>

        <button className="btn btn-secondary" onClick={baixarDados} disabled={exportando}>
          {exportando ? "Gerando..." : "Baixar meus dados"}
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Excluir conta</h2>
        <p className="page-subtitle">
          Esta ação é irreversível. Se você for o único membro da sua família, os dados dela (pessoas,
          categorias e transações) também são excluídos. Se a família for compartilhada, apenas a sua conta
          é removida.
        </p>

        <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>
          Excluir minha conta
        </button>
      </div>

      <Modal
        open={deleteModal}
        title="Confirmar exclusão de conta"
        onClose={() => setDeleteModal(false)}
      >
        <p>Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.</p>

        {erro && <div className="auth-error">{erro}</div>}

        <button className="btn btn-danger" onClick={confirmarExclusao} disabled={excluindo}>
          {excluindo ? "Excluindo..." : "Sim, excluir minha conta"}
        </button>
      </Modal>
    </>
  );
}
