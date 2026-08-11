import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";

const MENSAGEM_ERRO_CARGA = "Não foi possível carregar os dados. Tente novamente.";

/*
 * Nem todo endpoint devolve array puro: `/transacoes` é paginado e vem
 * embrulhado em { itens, paginaAtual, tamanhoPagina, totalItens }, enquanto
 * `/pessoas` e `/categorias` devolvem a lista direto. Aceitar as duas formas
 * aqui evita que cada página precise saber qual é qual.
 *
 * Devolve null quando o corpo não é nenhuma das duas — e esse null é o ponto.
 * Antes o hook prometia T[] no tipo e repassava o que a API mandasse, sem
 * conferir: quando a API passou a paginar transações, o erro só apareceu lá no
 * `.map()` do componente, como "e.map is not a function", derrubando a tela
 * inteira. Corpo inesperado agora vira mensagem de erro, não tela branca.
 */
function extrairLista<T>(corpo: unknown): T[] | null {
  if (Array.isArray(corpo)) return corpo as T[];

  if (corpo && typeof corpo === "object" && "itens" in corpo) {
    const { itens } = corpo as { itens: unknown };
    if (Array.isArray(itens)) return itens as T[];
  }

  return null;
}

export function useApiResource<T>(endpoint: string) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    api
      .get<unknown>(endpoint)
      .then((response) => {
        if (cancelado) return;

        const lista = extrairLista<T>(response.data);

        if (lista) setDados(lista);
        else setErro(MENSAGEM_ERRO_CARGA);
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
      const response = await api.get<unknown>(endpoint);
      const lista = extrairLista<T>(response.data);

      if (lista) setDados(lista);
      else setErro(MENSAGEM_ERRO_CARGA);
    } catch {
      setErro(MENSAGEM_ERRO_CARGA);
    }
  }, [endpoint]);

  return { dados, carregando, erro, recarregar };
}
