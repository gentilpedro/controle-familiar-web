import { useState } from "react";
import { api } from "../api/api";
import { useAuth } from "../hooks/useAuth";
import type { ApiEnvelope, Familia } from "../types/Auth";

function mensagemDeErro(erro: unknown): string {
  const resposta = (erro as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return resposta ?? "Não foi possível concluir a ação.";
}

export default function MinhaFamilia() {
  const { usuario, familia, atualizarFamilia } = useAuth();

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregandoAcao, setCarregandoAcao] = useState<string | null>(null);

  const souAdministrador = familia?.membros.find((m) => m.id === usuario?.id)?.ehAdministrador ?? false;
  const linkConvite = familia ? `${window.location.origin}/registrar?codigo=${familia.codigoConvite}` : "";

  function limparMensagens() {
    setErro("");
    setSucesso("");
  }

  async function executar(chave: string, acao: () => Promise<{ data: ApiEnvelope<Familia> }>) {
    limparMensagens();
    setCarregandoAcao(chave);

    try {
      const response = await acao();
      atualizarFamilia(response.data.data!);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregandoAcao(null);
    }
  }

  function regenerarCodigo() {
    return executar("codigo", () => api.post<ApiEnvelope<Familia>>("/familia/regenerar-codigo"));
  }

  function removerMembro(membroId: number) {
    return executar(`remover-${membroId}`, () => api.delete<ApiEnvelope<Familia>>(`/familia/membros/${membroId}`));
  }

  function promoverMembro(membroId: number) {
    return executar(`promover-${membroId}`, () => api.post<ApiEnvelope<Familia>>(`/familia/membros/${membroId}/promover`));
  }

  function rebaixarMembro(membroId: number) {
    return executar(`rebaixar-${membroId}`, () => api.post<ApiEnvelope<Familia>>(`/familia/membros/${membroId}/rebaixar`));
  }

  async function copiarLinkConvite() {
    limparMensagens();

    try {
      await navigator.clipboard.writeText(linkConvite);
      setSucesso("Link de convite copiado — é só colar e mandar pra pessoa.");
    } catch {
      setErro("Não consegui copiar automaticamente. Copie o link manualmente.");
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minha Família</h1>
          <p className="page-subtitle">
            {souAdministrador
              ? "Como administrador, você pode convidar e gerenciar os membros da família."
              : "Compartilhe o código abaixo para outras pessoas entrarem e verem os mesmos dados."}
          </p>
        </div>
      </div>

      {erro && <div className="auth-error">{erro}</div>}
      {sucesso && <div className="auth-success">{sucesso}</div>}

      <div className="card">
        <p className="summary-label">Família</p>
        <h2 style={{ marginTop: 0 }}>{familia?.nome}</h2>

        <p className="summary-label">Código de convite</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="invite-code">{familia?.codigoConvite}</span>

          <button className="btn btn-primary" onClick={copiarLinkConvite}>
            Copiar link de convite
          </button>

          {souAdministrador && (
            <button
              className="btn btn-secondary"
              onClick={regenerarCodigo}
              disabled={carregandoAcao === "codigo"}
            >
              {carregandoAcao === "codigo" ? "Gerando..." : "Gerar novo código"}
            </button>
          )}
        </div>

        <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          Manda o link pronto (whatsapp, e-mail, etc.) — quem abrir já cai no cadastro com o código preenchido.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Membros</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papel</th>
                {souAdministrador && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {familia?.membros.map((membro) => {
                const souEu = membro.id === usuario?.id;

                return (
                  <tr key={membro.id}>
                    <td>
                      {membro.nome}
                      {souEu && " (você)"}
                    </td>
                    <td>
                      {membro.ehAdministrador ? (
                        <span className="badge badge-ambas">Admin</span>
                      ) : (
                        <span className="badge">Membro</span>
                      )}
                    </td>
                    {souAdministrador && (
                      <td className="table-actions">
                        {membro.ehAdministrador ? (
                          <button
                            className="btn btn-secondary"
                            disabled={carregandoAcao === `rebaixar-${membro.id}`}
                            onClick={() => rebaixarMembro(membro.id)}
                          >
                            Rebaixar
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            disabled={carregandoAcao === `promover-${membro.id}`}
                            onClick={() => promoverMembro(membro.id)}
                          >
                            Promover
                          </button>
                        )}

                        {!souEu && (
                          <button
                            className="btn btn-danger"
                            disabled={carregandoAcao === `remover-${membro.id}`}
                            onClick={() => removerMembro(membro.id)}
                          >
                            Remover
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
