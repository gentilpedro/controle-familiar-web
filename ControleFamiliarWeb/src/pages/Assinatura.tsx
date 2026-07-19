import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/api";
import { mensagemDeErro } from "../utils/erro";
import type { ApiEnvelope } from "../types/Auth";
import type { AssinaturaStatus, CheckoutResponse, PortalResponse, TipoPlano } from "../types/Assinatura";

const STATUS_TEXTO: Record<string, string> = {
  Nenhuma: "Sem assinatura",
  EmTeste: "Período de teste",
  Ativa: "Ativa",
  Inadimplente: "Pagamento pendente",
  Cancelada: "Cancelada"
};

function formatarData(data: string | null) {
  if (!data) return null;
  return new Date(data).toLocaleDateString("pt-BR");
}

export default function Assinatura() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<AssinaturaStatus | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState<TipoPlano | "portal" | null>(null);

  useEffect(() => {
    let cancelado = false;

    api
      .get<ApiEnvelope<AssinaturaStatus>>("/assinatura/status")
      .then((response) => {
        if (!cancelado) setStatus(response.data.data!);
      })
      .catch((e) => {
        if (!cancelado) setErro(mensagemDeErro(e));
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function assinar(tipoPlano: TipoPlano) {
    setErro("");
    setProcessando(tipoPlano);

    try {
      const response = await api.post<ApiEnvelope<CheckoutResponse>>("/assinatura/checkout", { tipoPlano });
      window.location.href = response.data.data!.url;
    } catch (e) {
      setErro(mensagemDeErro(e));
      setProcessando(null);
    }
  }

  async function gerenciar() {
    setErro("");
    setProcessando("portal");

    try {
      const response = await api.post<ApiEnvelope<PortalResponse>>("/assinatura/portal");
      window.location.href = response.data.data!.url;
    } catch (e) {
      setErro(mensagemDeErro(e));
      setProcessando(null);
    }
  }

  if (carregando) {
    return <div className="page">Carregando...</div>;
  }

  const veioDoSucesso = searchParams.get("sucesso") === "1";
  const veioDoCancelamento = searchParams.get("cancelado") === "1";

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assinatura</h1>
          <p className="page-subtitle">
            {status?.temAcesso
              ? "Gerencie sua forma de pagamento, veja faturas ou cancele quando quiser."
              : "Assine um plano para liberar o acesso aos seus dados financeiros."}
          </p>
        </div>
      </div>

      {veioDoSucesso && (
        <div className="auth-success">
          Pagamento confirmado! Pode levar alguns segundos até o acesso ser liberado.
        </div>
      )}
      {veioDoCancelamento && <div className="auth-error">Checkout cancelado — nenhuma cobrança foi feita.</div>}
      {erro && <div className="auth-error">{erro}</div>}

      {status?.temAcesso ? (
        <div className="card">
          <h2 className="section-title">Sua assinatura</h2>

          <p className="summary-label">Plano Individual</p>
          <p>
            {STATUS_TEXTO[status.statusIndividual] ?? status.statusIndividual}
            {status.assinaturaIndividualValidaAte &&
              ` — válido até ${formatarData(status.assinaturaIndividualValidaAte)}`}
          </p>

          <p className="summary-label">Plano Família</p>
          <p>
            {STATUS_TEXTO[status.statusFamilia] ?? status.statusFamilia}
            {status.assinaturaFamiliaValidaAte && ` — válido até ${formatarData(status.assinaturaFamiliaValidaAte)}`}
          </p>

          <button className="btn btn-primary" onClick={gerenciar} disabled={processando === "portal"}>
            {processando === "portal" ? "Abrindo..." : "Gerenciar assinatura"}
          </button>
        </div>
      ) : (
        <div className="plano-grid">
          <div className="plano-card">
            <h2 className="section-title">Individual</h2>
            <p className="page-subtitle">Pra quem usa sozinho.</p>
            <ul className="plano-lista">
              <li>Acesso completo aos seus dados financeiros</li>
              {!status?.trialIndividualUsado && <li>7 dias grátis antes da primeira cobrança</li>}
            </ul>
            <button className="btn btn-primary" onClick={() => assinar(1)} disabled={processando === 1}>
              {processando === 1 ? "Abrindo..." : status?.trialIndividualUsado ? "Assinar" : "Começar teste grátis"}
            </button>
          </div>

          <div className="plano-card">
            <h2 className="section-title">Família</h2>
            <p className="page-subtitle">Libera o acesso para até 5 pessoas da mesma família.</p>
            <ul className="plano-lista">
              <li>Todos os membros da família usam com uma única assinatura</li>
            </ul>
            <button className="btn btn-primary" onClick={() => assinar(2)} disabled={processando === 2}>
              {processando === 2 ? "Abrindo..." : "Assinar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
