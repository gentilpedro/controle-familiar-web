import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import type { ApiEnvelope } from "../types/Auth";
import type { AssinaturaStatus } from "../types/Assinatura";

export default function RequireAssinatura() {
  const [temAcesso, setTemAcesso] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelado = false;

    api
      .get<ApiEnvelope<AssinaturaStatus>>("/assinatura/status")
      .then((response) => {
        if (!cancelado) setTemAcesso(response.data.data!.temAcesso);
      })
      .catch(() => {
        // Se a checagem falhar (rede, 401 já tratado pelo interceptor, etc.),
        // trata como sem acesso - mais seguro empurrar pra tela de
        // assinatura do que deixar passar pras rotas financeiras.
        if (!cancelado) setTemAcesso(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (temAcesso === null) {
    return <div className="page">Carregando...</div>;
  }

  if (!temAcesso) {
    return <Navigate to="/painel/assinatura" replace />;
  }

  return <Outlet />;
}
