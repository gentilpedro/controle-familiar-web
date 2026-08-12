# ControleFamiliarWeb (FiscalHub) — notas para o Claude

Frontend React 19 + TypeScript + Vite + React Router v7 do FiscalHub. Consome a API do repositório
irmão `controle-familiar-api` (repositório separado, não é monorepo).

## Padrão de trabalho ("bloco")

Uma mudança de escopo focado = uma branch = um PR = um merge. Sempre verificar com
`npm run build && npm run lint` **e `npx tsc --noEmit`** — `npm run build` roda só `vite build`, que
transpila sem checar tipos, então sozinho ele deixa passar erro de tipagem.

## Pessoa e Usuario: dois conceitos que se cruzam

Desde 2026-08, `Registrar.tsx` pede **idade** (`RegistrarPayload.idade`) e a API cria a `Pessoa` do
titular na mesma chamada — quem se cadastra já aparece na lista de Pessoas, sem precisar cadastrar a
si mesmo à mão antes de lançar a primeira transação. Ver `AuthService.Registrar` no repositório da
API.

`Pessoa.ehMembro` diz se ela representa uma conta da família. Em `Pessoas.tsx`, isso vira o badge
"Membro" e o botão de excluir some — a API recusa (400) apagar uma pessoa vinculada, então esconder
poupa a viagem ao servidor para descobrir isso. Pessoa cadastrada à mão (`ehMembro: false`) continua
funcionando como sempre: é o cadastro de quem não tem login, como um filho pequeno.

## Acesso: uso livre

O app **não tem cobrança**. Toda conta autenticada acessa as rotas financeiras; o único controle é o
`ProtectedRoute` (sessão válida). Não existe gate de assinatura, página de planos nem trial.

## Assinatura via Stripe — revertida em 2026-08-11

A cobrança chegou a ser implementada (PRs #18, #19, #21) e foi revertida junto com o lado da API.
O código está preservado na branch **`backup/assinatura-stripe`** — lá ficam `pages/Assinatura.tsx`,
`routes/RequireAssinatura.tsx` e `types/Assinatura.ts`.

Vale registrar o motivo, porque afeta como reintroduzir isso: o `RequireAssinatura` tratava **qualquer
falha** da chamada a `/assinatura/status` como "sem acesso" e redirecionava para a página de
assinatura. Com o endpoint removido da API, isso trancaria todo mundo fora do painel — o front tinha
que ser revertido no mesmo movimento que o backend, não depois.

Se a cobrança voltar: um gate que trata erro de rede como "não pagou" transforma instabilidade da API
em bloqueio total do produto. Vale distinguir "a API respondeu que não tem acesso" de "não consegui
perguntar".

## Landing page (`src/pages/Landing.tsx`)

Rota pública `/`, antes do login. Redesenhada em 2026-08 com identidade derivada do livro-caixa:
paleta de papel-razão, Georgia no display e monoespaçada com `font-variant-numeric: tabular-nums` nas
cifras. O hero mostra um **extrato compartilhado** com lançamentos de exemplo — o `SALDO` é a soma
exata das linhas em `LANCAMENTOS`, então mexer numa linha exige conferir o total e o `aria-label`.

Os estilos ficam em `src/styles/landing.css`, importado pelo próprio componente (o Vite separa esse
CSS junto com a rota).

## Sistema visual (landing + painel)

Desde 2026-08 a identidade do livro-caixa vale no app inteiro, não só na landing. **Os tokens moram
no `:root` do `app.css`** — `--papel`, `--superficie`, `--tinta`, `--tinta-suave`, `--credito`,
`--debito`, `--pauta`, mais `--display`/`--corpo`/`--cifra`. O `landing.css` só mantém aliases
`--lp-*` apontando para eles, para não reescrever as dezenas de referências: **mudar a paleta se faz
num lugar só.**

Regras que sustentam o padrão:

- **Toda cifra usa `--cifra` com `font-variant-numeric: tabular-nums` e alinha à direita** (classe
  `.celula-valor`, com `.credito`/`.debito` para a cor). É isso que põe as casas decimais em coluna e
  faz a tabela ler como extrato.
- Títulos em `--display` (Georgia); rótulos e cabeçalhos de tabela em `--cifra` maiúscula espaçada,
  como sobrancelha de extrato.
- Separação vem de régua fina (`--pauta`), não de sombra. O saldo leva régua dupla, a convenção de
  fechamento do livro-caixa.
- ⚠️ `.btn-secondary` tem texto em `--tinta`; sobre a sidebar escura ele precisa da inversão que está
  em `.sidebar-sair`. Botão novo dentro da sidebar exige o mesmo cuidado.

A copy é de uso livre: pode dizer "grátis" e "sem cartão de crédito" sem ressalva, já que agora é
verdade. Se a cobrança voltar, essa copy precisa voltar a ser qualificada.

## CSS

`.btn` (`src/styles/app.css`) tem `display: inline-flex; align-items: center; justify-content: center;`
— sem isso, botões renderizados como `<Link>` (que vira `<a>`, `display: inline` por padrão) não
centralizam o texto verticalmente dentro da altura fixa. `<button class="btn">` disfarça o bug, mas
qualquer `<Link className="btn ...">` novo depende dessa regra. A landing repete o cuidado no
`.lp-botao`.

## Deploy e release

Deploy pela integração nativa de Git da Vercel (push na `main` → produção; PR → preview), com
**Root Directory = `ControleFamiliarWeb`**. Não há workflow de deploy no repositório.

`.github/workflows/release.yml` roda em push na `main`: checa tipos, lint e build e cria a Release com
a próxima versão (`vN.N.N`, patch incrementado). Não anexa o bundle — o `dist/` do CI sai sem
`VITE_API_URL` de produção e apontaria para localhost.

## Sessão em cookie HttpOnly e o proxy (desde 2026-08)

O token saiu do `localStorage` para um **cookie HttpOnly** — invisível ao JavaScript, então um XSS não
sequestra mais a sessão. Isso obrigou uma mudança de arquitetura:

**O navegador nunca fala com `fiscalhub.runasp.net` diretamente.** O `vercel.json` reescreve
`/api/*` para a API, e o `vite.config.ts` faz o mesmo em desenvolvimento. Nos dois casos tudo é
same-origin, e o cookie é **first-party**.

⚠️ Isso não é otimização, é requisito: os domínios são diferentes (`*.vercel.app` × `*.runasp.net`),
então sem o proxy o cookie seria de terceiro — **Safari e Firefox bloqueiam por padrão** e o login
simplesmente não funcionaria neles.

Consequências práticas:

- **`VITE_API_URL` não existe mais.** A URL da API vive no rewrite do `vercel.json`; mudá-la não
  exige rebuild do frontend. Em dev, `API_PROXY_TARGET` (sem prefixo `VITE_`) ajusta o alvo do proxy.
- **A ordem dos rewrites importa.** O de `/api/*` precisa vir **antes** do fallback `/(.*)` →
  `/index.html`, senão a SPA engole as chamadas de API.
- **Toda escrita manda o header `X-Requisicao-FiscalHub`** (configurado no `api.ts`). A API rejeita
  com 403 requisições de escrita autenticadas por cookie sem ele — é a proteção CSRF, que o header
  `Authorization` não precisava. Ver `CsrfMiddleware` no repositório da API.
- **`logout` virou assíncrono**: só a API apaga um cookie HttpOnly, e o endpoint também revoga o
  token no servidor.
- **O `AuthContext` sempre chama `/auth/me` no start.** Com cookie HttpOnly não há como o JavaScript
  saber de antemão se existe sessão. O 401 dessa chamada é o caso normal de visitante, então
  `/auth/me` e `/auth/login` estão fora do redirecionamento automático do interceptor — sem essa
  exceção, quem abrisse a landing seria jogado no `/login`.

A CSP ficou `connect-src 'self'`: como não há mais chamada cross-origin, não é preciso listar o host
da API.
