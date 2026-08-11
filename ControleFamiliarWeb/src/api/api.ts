import axios from "axios";

/**
 * Header que a API exige nas requisições de escrita (proteção CSRF).
 */
// Com a sessão em cookie, o navegador anexa a credencial sozinho — inclusive
// numa requisição disparada por outro site. Um formulário HTML de terceiros não
// consegue definir header nenhum, e mandar um header customizado obriga o
// navegador a fazer preflight CORS, que a API recusa para origens estranhas.
// Ver CsrfMiddleware no repositório da API.
const HEADER_CSRF = "X-Requisicao-FiscalHub";

/*
 * baseURL relativa de propósito: em produção o rewrite do vercel.json manda
 * /api/* para a API, e em desenvolvimento o proxy do vite.config.ts faz o
 * mesmo. Nos dois casos o navegador só conversa com a própria origem — é isso
 * que torna o cookie de sessão first-party e o mantém funcionando no Safari e
 * no Firefox, que bloqueiam cookie de terceiro por padrão.
 *
 * Por isso VITE_API_URL deixou de existir: o destino real é configurado no
 * rewrite, não no bundle. Uma mudança na URL da API não exige mais rebuild do
 * frontend.
 */
export const api = axios.create({
  baseURL: "/api",

  // Sem isto o navegador não envia o cookie de sessão.
  withCredentials: true,

  headers: {
    [HEADER_CSRF]: "1"
  }
});

/*
 * Rotas cujo 401 é esperado e NÃO deve redirecionar.
 *
 * /auth/me é chamado no start para descobrir se existe sessão. Para um visitante
 * na landing o 401 é a resposta normal — redirecionar ali jogaria todo mundo
 * para o /login antes de ver a página pública.
 *
 * /auth/login responde 401 quando a senha está errada; quem trata isso é a
 * própria tela, mostrando a mensagem.
 */
const ROTAS_SEM_REDIRECIONAMENTO = ["/auth/me", "/auth/login"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const ehRotaEsperada = ROTAS_SEM_REDIRECIONAMENTO.some((rota) => url.startsWith(rota));

    if (error.response?.status === 401 && !ehRotaEsperada) {
      // Não há mais token para descartar aqui — a sessão vive num cookie
      // HttpOnly, que só a API consegue apagar. Um 401 significa que ela
      // acabou; resta tirar o usuário da área logada.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
