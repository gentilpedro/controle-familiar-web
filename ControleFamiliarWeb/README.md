# ControleFamiliarWeb — aplicação Vite

Esta é a pasta da aplicação em si. A visão geral do projeto (funcionalidades, autenticação, telas) está no [`ReadMe.md` da raiz do repositório](../ReadMe.md) — aqui ficam só as instruções de quem vai mexer no código.

---

## 🏃 Rodando localmente

```bash
npm install
cp .env.example .env   # no Windows: copy .env.example .env
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

A API (`controle-familiar-api`) precisa estar rodando — sem ela, o login falha e as telas ficam vazias.

---

## ⚙️ Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim em produção | URL base da API, **com** o sufixo `/api` (ex.: `https://fiscalhub.runasp.net/api`) |

Em desenvolvimento, sem a variável definida o cliente cai no padrão `https://localhost:7106/api`. Em um build de produção a aplicação **falha explicitamente** se `VITE_API_URL` não estiver definida (`src/api/api.ts`) — isso é intencional: sem esse erro, um build de produção sairia silenciosamente apontando para `localhost` e só quebraria na mão do usuário.

O Vite grava o valor **no momento do build**, não em tempo de execução. Mudar a variável no painel da Vercel não altera um deploy já publicado — é preciso disparar um novo build (push ou *Redeploy*).

---

## 📜 Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve o `dist/` já buildado, para conferir o resultado do build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |

⚠️ `npm run build` roda apenas `vite build`, que transpila **sem checar tipos**. Um erro de tipo não quebra o build. Antes de abrir um PR, rode os dois:

```bash
npx tsc --noEmit && npm run lint && npm run build
```

É exatamente o que o CI verifica.

---

## 🧱 Estrutura

```bash
src/
  api/          # cliente axios (interceptors de token e de 401)
  components/   # Layout, Modal, ErrorBoundary
  context/      # AuthContext
  hooks/        # useAuth, useApiResource
  pages/        # Landing, Login, Registrar, Home, Pessoas, Categorias,
                # Transacoes, Relatorio, MinhaFamilia, MeusDados,
                # Assinatura, Privacidade
  routes/       # AppRoutes, ProtectedRoute, RequireAssinatura
  styles/       # app.css
  types/        # tipos compartilhados
  utils/        # format, erro, badge
```

---

## 🚀 Deploy (Vercel)

Quem publica é a **integração nativa de Git da Vercel**, não um workflow deste repositório: todo push na `main` gera um deploy de produção, e cada Pull Request ganha um deploy de preview automático.

Configuração no painel da Vercel:

* **Root Directory** → `ControleFamiliarWeb` (a aplicação não está na raiz do repositório)
* **Environment Variables** → `VITE_API_URL`

### `vercel.json`

* **Rewrite de SPA** (`/(.*)` → `/index.html`) — necessário porque o app usa `BrowserRouter`. Sem isso, recarregar a página em uma rota como `/painel/transacoes` retornaria 404, já que não existe arquivo nesse caminho.
* **Headers de segurança** — CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.

⚠️ A CSP tem `connect-src 'self' https://fiscalhub.runasp.net`. Se a URL da API mudar, ela precisa ser atualizada aqui também — senão o navegador bloqueia todas as chamadas, mesmo com `VITE_API_URL` correta.

### CORS

A API só aceita requisições da origem configurada no secret `WEB_ORIGIN` do repositório da API. Se o domínio de produção mudar, esse secret precisa ser atualizado lá.

---

## 🏷️ Versionamento e releases

Todo push na `main` dispara `.github/workflows/release.yml`, que verifica o código (tipos, lint e build) e, no fim, cria uma **Release** no GitHub com a próxima versão.

A versão sai da maior tag existente no formato `vN.N.N`, incrementando o patch:

```
(nenhuma tag) → v1.0.0 → v1.0.1 → v1.0.2 → ...
```

Para saltar de minor ou major, crie a tag manualmente e o próximo push continua a contagem a partir dela:

```bash
git tag v1.1.0 && git push origin v1.1.0
```

As notas são geradas a partir dos títulos dos PRs mergeados desde a release anterior — títulos descritivos viram o changelog.

Nenhum bundle é anexado à release: o `dist/` gerado no CI não tem as variáveis de ambiente de produção (apontaria para `localhost`), e o bundle que realmente vai ao ar é o que a Vercel constrói. O build no CI serve como verificação, não como artefato distribuível.

Como esse workflow não faz o deploy, uma release falhar **não** impede a Vercel de publicar — as duas coisas reagem ao mesmo push de forma independente. Para reverter um deploy, use *Instant Rollback* na aba **Deployments** da Vercel.
