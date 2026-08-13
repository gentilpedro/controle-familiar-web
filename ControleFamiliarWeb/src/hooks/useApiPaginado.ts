import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";

const MENSAGEM_ERRO_CARGA = "Não foi possível carregar os dados. Tente novamente.";

/*
 * Espelha o PaginacaoResultado<T> da API. `totalPaginas` vem calculado de lá —
 * não recalcular aqui evita as duas pontas divergirem sobre o que é a última
 * página.
 */
interface Pagina<T> {
  itens: T[];
  totalItens: number;
  totalPaginas: number;
}

/*
 * Confere o formato em runtime em vez de confiar no tipo, pelo mesmo motivo que
 * o useApiResource passou a conferir: um corpo diferente do esperado tem que
 * virar mensagem de erro, não `undefined.map` no meio da renderização.
 */
function extrairPagina<T>(corpo: unknown): Pagina<T> | null {
  if (!corpo || typeof corpo !== "object") return null;

  const { itens, totalItens, totalPaginas } = corpo as Record<string, unknown>;

  if (!Array.isArray(itens)) return null;
  if (typeof totalItens !== "number" || typeof totalPaginas !== "number") return null;

  return { itens: itens as T[], totalItens, totalPaginas };
}

/**
 * Lista um endpoint paginado da API, uma página por vez.
 *
 * Para endpoint que devolve a lista inteira (`/pessoas`, `/categorias`), use o
 * `useApiResource`. Hoje só `/transacoes` é paginado.
 *
 * `filtros` vira query string junto de `pagina`/`tamanhoPagina` — chave com
 * valor `undefined` é omitida, então um filtro "sem valor" simplesmente não é
 * enviado. Trocar um filtro **não** volta para a página 1 sozinho: quem mexeu
 * no filtro chama `irPara(1)` no mesmo handler, porque só quem mudou o filtro
 * sabe se a mudança invalida a posição atual.
 */
export function useApiPaginado<T>(
  endpoint: string,
  tamanhoPagina: number,
  filtros?: Record<string, string | number | undefined>
) {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<T[]>([]);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  /*
   * Contador que força o efeito a rodar mesmo quando a página pedida é a mesma
   * de agora — sem ele, recarregar estando na primeira página não refaria
   * requisição nenhuma, e `carregando` ficaria preso em true.
   */
  const [recarga, setRecarga] = useState(0);

  /*
   * Serializado porque o objeto de filtros é montado no corpo do componente:
   * como literal, ele é uma referência nova a cada render e o efeito rodaria
   * em loop. A string só muda quando algum valor muda de verdade.
   */
  const filtrosSerializados = JSON.stringify(filtros ?? {});

  useEffect(() => {
    let cancelado = false;

    const params = { pagina, tamanhoPagina, ...(JSON.parse(filtrosSerializados) as object) };

    api
      .get<unknown>(endpoint, { params })
      .then((response) => {
        if (cancelado) return;

        const resultado = extrairPagina<T>(response.data);

        if (!resultado) {
          setErro(MENSAGEM_ERRO_CARGA);
          return;
        }

        setDados(resultado.itens);
        setTotalItens(resultado.totalItens);
        setTotalPaginas(resultado.totalPaginas);
        setErro("");
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
  }, [endpoint, pagina, tamanhoPagina, filtrosSerializados, recarga]);

  /*
   * `carregando` sobe aqui, no handler, e não dentro do efeito: o lint do
   * projeto barra setState síncrono em efeito, e de todo modo quem sabe que uma
   * busca vai começar é quem pediu a troca de página.
   */
  const irPara = useCallback((destino: number) => {
    setCarregando(true);
    setPagina(Math.max(destino, 1));
    setRecarga((n) => n + 1);
  }, []);

  /**
   * Volta para a primeira página e busca de novo. Voltar faz parte: a API
   * ordena do mais recente para o mais antigo, então o registro recém-criado
   * nasce no topo da página 1 — recarregar sem sair da página 4 esconderia
   * justamente o que o usuário acabou de cadastrar.
   */
  const recarregar = useCallback(async () => {
    irPara(1);
  }, [irPara]);

  return { dados, pagina, totalItens, totalPaginas, carregando, erro, irPara, recarregar };
}
