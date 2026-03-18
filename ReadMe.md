# 📊 Controle Financeiro Familiar - Frontend

Frontend desenvolvido em **React + Vite + TypeScript** para consumo da API .NET do sistema de controle financeiro familiar.

---

# 🚀 Tecnologias utilizadas

* React
* Vite
* TypeScript
* Axios
* Recharts (gráficos)
* CSS customizado

---

# 📦 Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

* Node.js (versão 18+ recomendada)
* npm ou yarn
* API .NET rodando localmente

---

# 📥 1. Clonar o projeto

```bash
git clone https://github.com/seu-usuario/controle-financeiro-web.git

cd controle-financeiro-web
```

---

# 📦 2. Instalar dependências

```bash
npm install
```

ou

```bash
yarn
```

---

# ▶️ 5. Rodar o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```bash
http://localhost:5173
```

---

# 🧱 Estrutura do projeto

```
src/
 ├ api/
 ├ components/
 ├ pages/
 ├ types/
 ├ routes/
 ├ styles/
```

---

# 📄 Páginas do sistema

## 🏠 Home

* Dashboard inicial
* Navegação do sistema

---

## 👥 Pessoas

* Listagem de pessoas
* Cadastro de pessoa
* Edição (modal)
* Exclusão (modal)

Campos:

* Nome
* Idade

---

## 🏷 Categorias

* Listagem de categorias
* Cadastro
* Finalidade:

  * Receita
  * Despesa
  * Ambas

---

## 💰 Transações

* Cadastro de receitas/despesas
* Seleção de pessoa
* Seleção de categoria

Campos:

* Descrição
* Valor
* Tipo (Receita/Despesa)
* Pessoa
* Categoria

---

## 📈 Relatórios

* Gráfico de receitas vs despesas por pessoa
* Gráfico de despesas por categoria
* Totais gerais:

  * Receitas
  * Despesas
  * Saldo

---

# 📊 Exportação de relatórios

O sistema permite exportar:

### Excel

* Totais por pessoa
* Totais por categoria

---

### Download via frontend

Utiliza `blob` para download automático:

```ts
const response = await api.get("/relatorios/excel-pessoa", {
  responseType: "blob"
});
```

---

# 🎨 Estilização

* CSS customizado (`app.css`)
* Layout com sidebar
* Cards e tabelas
* Modais reutilizáveis

---

# 🧠 Boas práticas aplicadas

* Separação por camadas
* Tipagem com TypeScript
* Componentização
* Uso de services (API)
* Uso de DTOs no backend
* Arquitetura escalável

---

# ⚠️ Observações

* Certifique-se que a API esteja rodando antes de iniciar o frontend
* Verifique a URL da API no `.env`
* Caso tenha erro de CORS, configure na API .NET

---

# 🚀 Melhorias futuras

* Autenticação JWT
* Filtros por período
* Dashboard com gráficos mensais
* Exportação PDF
* Paginação de tabelas
* Dark mode

---

# 👨‍💻 Autor

Projeto desenvolvido para fins de estudo e avaliação técnica.

---

# 📌 Conclusão

Este projeto implementa um sistema completo de controle financeiro com:

* CRUD de pessoas e categorias
* Registro de transações
* Dashboard com gráficos
* Exportação de relatórios

Estruturado seguindo boas práticas de desenvolvimento frontend moderno.
