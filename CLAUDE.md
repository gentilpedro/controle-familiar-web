# ControleFamiliarWeb (FiscalHub) — notas para o Claude

Frontend React 19 + TypeScript + Vite + React Router v7 do FiscalHub. Consome a API do repositório
irmão `controle-familiar-api` (repositório separado, não é monorepo).

## Padrão de trabalho ("bloco")

Uma mudança de escopo focado = uma branch = um PR = um merge. Sempre verificar com
`npm run build && npm run lint` **e `npx tsc --noEmit`** — `npm run build` roda só `vite build`, que
transpila sem checar tipos, então sozinho ele deixa passar erro de tipagem.

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
CSS junto com a rota). **Os tokens são declarados em `.lp`, não em `:root`** — o painel logado usa a
paleta azul do `app.css`, e misturar os dois vazaria uma identidade na outra.

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

⚠️ A CSP em `ControleFamiliarWeb/vercel.json` tem `connect-src 'self' https://fiscalhub.runasp.net`
**hardcoded**. Se a URL da API mudar, ela precisa ser atualizada lá também, senão o navegador bloqueia
todas as chamadas mesmo com `VITE_API_URL` correta.
