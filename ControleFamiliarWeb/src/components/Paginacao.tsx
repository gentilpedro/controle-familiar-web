interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  totalItens: number;
  tamanhoPagina: number;
  carregando: boolean;
  itemSingular: string;
  itemPlural: string;
  onIrPara: (pagina: number) => void;
}

/**
 * Rodapé de navegação de uma lista paginada — a contagem à esquerda, o
 * controle à direita, fechando a tabela como o rodapé de um extrato.
 */
export default function Paginacao({
  pagina,
  totalPaginas,
  totalItens,
  tamanhoPagina,
  carregando,
  itemSingular,
  itemPlural,
  onIrPara,
}: PaginacaoProps) {
  // Lista vazia já tem a própria mensagem dentro da tabela
  if (totalItens === 0) return null;

  const primeiro = (pagina - 1) * tamanhoPagina + 1;
  const ultimo = Math.min(pagina * tamanhoPagina, totalItens);

  return (
    <nav className="paginacao" aria-label="Navegação entre páginas">
      {/*
        aria-live: trocar de página não muda o foco nem a rota, então sem isto
        quem usa leitor de tela clica em Próxima e não recebe confirmação de
        que a lista mudou.
      */}
      <p className="paginacao-contagem" aria-live="polite">
        {primeiro}–{ultimo} de {totalItens} {totalItens === 1 ? itemSingular : itemPlural}
      </p>

      {totalPaginas > 1 && (
        <div className="paginacao-controles">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={carregando || pagina <= 1}
            onClick={() => onIrPara(pagina - 1)}
          >
            Anterior
          </button>

          <span className="paginacao-posicao">
            Página {pagina} de {totalPaginas}
          </span>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={carregando || pagina >= totalPaginas}
            onClick={() => onIrPara(pagina + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </nav>
  );
}
