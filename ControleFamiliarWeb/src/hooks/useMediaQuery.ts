import { useCallback, useSyncExternalStore } from "react";

/**
 * Responde se uma media query casa agora, e re-renderiza quando isso muda.
 *
 * Existe porque o Recharts recebe medida em número (largura de eixo, margem),
 * não em CSS: valor que depende do tamanho da tela precisa chegar em JS. Para
 * o resto do app, media query no CSS continua sendo o caminho.
 *
 * useSyncExternalStore em vez de useEffect + setState: o matchMedia já tem
 * exatamente o formato de assinatura que ele espera, e assim não há um primeiro
 * render com o valor errado para depois corrigir.
 */
export function useMediaQuery(consulta: string): boolean {
  const assinar = useCallback(
    (aoMudar: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", aoMudar);
      return () => lista.removeEventListener("change", aoMudar);
    },
    [consulta]
  );

  const ler = useCallback(() => window.matchMedia(consulta).matches, [consulta]);

  return useSyncExternalStore(assinar, ler);
}
