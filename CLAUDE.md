# ControleFamiliarWeb (FiscalHub) — notas para o Claude

Frontend React 19 + TypeScript + Vite + React Router v7 do FiscalHub (`fiscalhub.runasp.net`). Consome
a API do repositório irmão `controle-familiar-api` (repositório separado, não é monorepo).

## Padrão de trabalho ("bloco")

Uma mudança de escopo focado = uma branch = um PR = um merge. Sempre verificar com
`npm run build && npm run lint` (e `npx tsc --noEmit`, já que `npm run build` roda só `vite build` e não
faz checagem de tipo completa por si só) antes do merge.

## Assinatura paga via Stripe (implementada em 2026-07)

O app deixou de ser gratuito: rotas financeiras exigem assinatura ativa (ver
`controle-familiar-api/CLAUDE.md` pro lado do backend — planos, trial, paywall 402, teto de 5 membros
por família).

### Arquitetura (neste frontend)

- `src/types/Assinatura.ts` — `AssinaturaStatus`, `TipoPlano` (`1 | 2`, Individual/Família),
  `CheckoutResponse`, `PortalResponse`.
- `src/pages/Assinatura.tsx` (rota `/painel/assinatura`) — busca `GET /assinatura/status`; sem acesso,
  mostra os dois planos com botão "Assinar"/"Começar teste grátis" (`POST /assinatura/checkout` →
  redirect via `window.location.href` pra URL do Stripe Checkout); com acesso, mostra status atual +
  "Gerenciar assinatura" (`POST /assinatura/portal` → redirect pro Customer Portal). **Não mostra preço
  fixo de propósito** — o valor só existe no Dashboard do Stripe, a página nunca deveria hardcodar um
  número que pode mudar sem deploy.
- `src/routes/RequireAssinatura.tsx` (modelado no `ProtectedRoute.tsx` existente) — consulta
  `/assinatura/status` e redireciona pra `/painel/assinatura` se `temAcesso` for `false` (falha na
  checagem também conta como sem acesso). Envolve só `pessoas`/`categorias`/`transacoes`/`relatorios`
  via uma rota pathless em `AppRoutes.tsx` — `minha-familia`, `meus-dados` e a própria `assinatura`
  ficam fora do gate.
- Link "Assinatura" na sidebar (`Layout.tsx`).

### Landing page (`src/pages/Landing.tsx`)

Rota pública `/`, antes do login. Copy ajustada em 2026-07 pra refletir que o app é pago: **nunca
afirma "grátis"/"sem cartão de crédito" sem qualificar** — o trial de 7 dias existe só no plano
Individual e mesmo assim o Stripe Checkout pede cartão (cobrança só começa depois do trial, mas o
cartão é coletado na hora). Preço também não é hardcodado aqui pelo mesmo motivo do `Assinatura.tsx`
(valores ainda em modo teste no Stripe quando isso foi escrito).

### CSS

`.btn` (`src/styles/app.css`) tem `display: inline-flex; align-items: center; justify-content: center;`
— sem isso, botões renderizados como `<Link>` (que vira `<a>`, `display: inline` por padrão) não
centralizam o texto verticalmente dentro da altura fixa de 42px. `<button class="btn">` disfarça o bug
(estilo padrão do navegador já centraliza), mas qualquer `<Link className="btn ...">` novo depende
dessa regra.

## Pendências de go-live do Stripe

Três passos manuais no Dashboard do Stripe/GitHub (não é código deste repo) — ver `CLAUDE.md` do
`controle-familiar-api` e a memória "Stripe go-live checklist": criar Products/Prices em modo live,
configurar o webhook endpoint de produção, habilitar o Customer Portal.
