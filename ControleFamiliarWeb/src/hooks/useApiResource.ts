import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";

const MENSAGEM_ERRO_CARGA = "Não foi possível carregar os dados. Tente novamente.";

export function useApiResource<T>(endpoint: string) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    api
      .get<T[]>(endpoint)
      .then((response) => {
        if (!cancelado) setDados(response.data);
      })
      .catch(() => {
        if (!cancelado) setErro(MENSAGEM_ERRO_CARGA);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [endpoint]);

  const recarregar = useCallback(async () => {
    setErro("");

    try {
      const response = await api.get<T[]>(endpoint);
      setDados(response.data);
    } catch {
      setErro(MENSAGEM_ERRO_CARGA);
    }
  }, [endpoint]);

  return { dados, carregando, erro, recarregar };
}
