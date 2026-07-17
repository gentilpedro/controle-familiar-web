# 💰 Controle Financeiro Web

Frontend em **React + TypeScript + Vite** do Controle Financeiro — cadastro de pessoas, categorias, transações e relatórios, com login individual ou compartilhado entre uma família.

---

# 🚀 Tecnologias utilizadas

* [React 19](https://react.dev/) + TypeScript
* [Vite](https://vite.dev/)
* React Router
* Axios
* Recharts (gráficos dos relatórios)
* MUI (`@mui/material`)

---

# 🔐 Autenticação

O login é feito contra a [`controle-familiar-api`](https://github.com/gentilpedro/controle-familiar-api). Ao se cadastrar, o usuário escolhe:

* **Criar uma família nova** — uso individual, ele é o único membro.
* **Entrar em uma família existente** — informando o código de convite de outro membro, passando a compartilhar os mesmos dados (Pessoas, Categorias, Transações).

O token JWT fica em `localStorage`; rotas fora de `/login` e `/registrar` são protegidas (`src/routes/ProtectedRoute.tsx`) e redirecionam para `/login` sem sessão válida. Em `/minha-familia` dá pra ver o código de convite pra compartilhar.

---

# 📦 Como rodar o projeto

```bash
cd ControleFamiliarWeb
npm install
```

Configure a URL da API (copie `.env.example` para `.env` e ajuste se necessário):

```bash
VITE_API_URL=https://localhost:7106/api
```

```bash
npm run dev
```

A API (`controle-familiar-api`) precisa estar rodando — veja o `ReadMe.md` daquele repositório para subir o backend localmente.

---

# 🚀 Deploy (Vercel)

O deploy é feito pela integração nativa do Vercel com o GitHub: todo push na branch `main` gera um novo deploy de produção automaticamente, sem workflow de CI/CD próprio neste repositório.

### Configuração necessária no painel do Vercel

* **Environment Variables** → `VITE_API_URL` apontando para a URL de produção da API (ex.: `https://fiscalhub.runasp.net/api`).

O Vite grava o valor de `VITE_API_URL` no bundle **no momento do build** — se a variável for criada ou alterada no painel do Vercel, é preciso disparar um novo deploy (push, ou "Redeploy" na aba *Deployments*) para o valor novo entrar em vigor. Só reconfigurar a env var não atualiza um deploy já publicado.

### `vercel.json`

Contém o rewrite de SPA (`/(.*) → /index.html`), necessário porque o app usa `BrowserRouter` — sem isso, recarregar a página em rotas como `/transacoes` retornaria 404.

### CORS

A API só aceita requisições da origem configurada em `Cors:AllowedOrigins` (secret `WEB_ORIGIN` no repositório da API). Se o domínio de produção do Vercel mudar, esse secret precisa ser atualizado lá também.

---

# 🧱 Estrutura do projeto

```bash
src/
  api/          # cliente axios (interceptors de token e 401)
  components/   # Layout, Modal
  context/      # AuthContext
  pages/        # Home, Pessoas, Categorias, Transacoes, Relatorio, Login, Registrar, MinhaFamilia
  routes/       # AppRoutes, ProtectedRoute
  styles/       # app.css
  types/        # tipos compartilhados (Auth, Pessoa, Categoria, Transacao, Relatorios)
```

---

# 👨‍💻 Autor

Desenvolvido por **Pedro Gentil**
