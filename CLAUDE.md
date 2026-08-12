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

`Pessoa.ehMembro` diz se ela representa uma conta da família. Pessoa cadastrada à mão
(`ehMembro: false`) é o cadastro de quem não tem login — um filho pequeno, por exemplo.

**Não existe mais uma página `Pessoas` nem item `Pessoas` no menu** (desde 2026-08-12). O cadastro
manual de dependente virou uma seção dentro de `MinhaFamilia.tsx`, junto da tabela de Membros —
`souAdministrador` esconde tanto o formulário de criar quanto os botões de editar/excluir de cada
linha, espelhando a API (`PessoaService` agora exige admin pra criar/editar/excluir pessoa manual;
`GET /pessoas` continua aberto a qualquer membro). A tabela de Dependentes filtra
`pessoas.filter(p => !p.ehMembro)` — a pessoa de um membro já aparece na tabela de Membros acima,
listar de novo seria repetir a mesma informação.

O atalho da Home que apontava pra `/painel/pessoas` agora vai pra `/painel/minha-familia`.

## Acesso: uso livre

O app **não tem cobrança**. Toda conta autenticada acessa as rotas financeiras; o único controle é o
`ProtectedRoute` (sessão válida). Não existe gate de assinatura, página de planos nem trial.

## Categorias do sistema

A lista de `/categorias` mistura as categorias da família com as **base do sistema** (Água, Luz,
Mercado...), que não têm dono e aparecem para todo mundo. A API recusa editar ou excluir essas com
403, então a tela usa o campo `ehDoSistema` do response para simplesmente não desenhar os botões de
ação nelas — oferecer o botão e deixar a API negar depois é o comportamento a evitar.

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
  em `.btn.sidebar-sair`. O seletor leva as **duas** classes de propósito: as regras da sidebar vêm
  antes de `.btn-secondary` no `app.css` e, com uma classe só, perderiam a cascata — foi assim que o
  "Sair" ficou invisível. Botão novo dentro da sidebar exige o mesmo cuidado.

A copy é de uso livre: pode dizer "grátis" e "sem cartão de crédito" sem ressalva, já que agora é
verdade. Se a cobrança voltar, essa copy precisa voltar a ser qualificada.

## `/transacoes` é paginado — os outros não

A API devolve `/pessoas` e `/categorias` como array puro, mas **`/transacoes` vem embrulhado**:
`{ itens, paginaAtual, tamanhoPagina, totalItens, totalPaginas }`, com `tamanhoPagina` = 50 por
padrão e 200 no máximo (query string `pagina`/`tamanhoPagina`). Ver `TransacoesController` no
repositório da API.

O `useApiResource` aceita as duas formas e, se o corpo não for nenhuma delas, cai na mensagem de erro
em vez de repassar. Isso importa: antes ele prometia `T[]` no tipo e entregava o que viesse, então
quando a API passou a paginar, a aba de transações quebrou com `e.map is not a function` e derrubou a
tela inteira. Endpoint novo que devolva outro formato agora vira erro visível, não tela branca.

⚠️ **A tela ainda mostra só a primeira página** (50 lançamentos mais recentes), sem indicação disso.
Falta UI de paginação.

## Tipo da transação vem da categoria (desde 2026-08-12)

`Transacoes.tsx` não pergunta mais Receita/Despesa quando a categoria escolhida já decide isso
sozinha (`Categoria.finalidade` 1 ou 2) — escolher a categoria já define o tipo, e o `<select>` de
Tipo vira um badge somente-leitura. A pergunta manual só volta quando a categoria aceita as duas
finalidades (`finalidade === 3`, "Ambas" — ex.: a categoria do sistema "Outros"). Antes disso dava
pra escolher Tipo e Categoria incompatíveis (ex.: Despesa + categoria "Salário") e só descobrir no
400 da API (`TransacaoService`, REGRA 2) depois de enviar.

O catch do formulário passou a usar `mensagemDeErro` em vez de texto fixo — importa porque a regra
de menor de idade (REGRA 1: menor não lança receita) ainda pode disparar quando a categoria é
"Ambas", e antes essa explicação da API era descartada.

## Transações recorrentes/parceladas (desde 2026-08-12)

Compra parcelada em N meses e salário dividido por percentual em quinzenas. 8 PRs sequenciais nos
dois repositórios (4 API + 4 front), cada um dependendo do anterior — nenhum ainda mergeado no
momento em que isso foi escrito. Plano completo salvo em
`C:\Users\pedro.rodrigues\.claude\plans\foamy-knitting-lightning.md`. Os 4 blocos de API estão
prontos (ver `CLAUDE.md` do `controle-familiar-api`); aqui vai o lado do front.

**Passo 1 — `Transacao.data`**: antes disso, transação não tinha data nenhuma. `types/Transacao.ts`
ganha `data: string` (formato `DateOnly` da API, `"AAAA-MM-DD"`, sem hora). Primeiro `<input
type="date">` do projeto — não existia padrão anterior pra copiar.

⚠️ **`formatDate` tratava só datetime completo** (`RelatorioFamiliar.criadoEm`, com hora) — `new
Date("2026-08-15")` sem componente de hora é interpretado como **meia-noite UTC**, e num fuso atrás
de UTC (Brasil, UTC-3) isso volta um dia na exibição. Achado ao ligar a coluna Data em
`Transacoes.tsx`. `formatDate` agora detecta string `"AAAA-MM-DD"` pura (regex) e monta o `Date` a
partir dos componentes locais (`new Date(ano, mes-1, dia)`), sem passar pelo parser — datetime
completo continua pelo caminho antigo. Endpoint novo que devolva uma data sem hora deve continuar
funcionando por essa mesma função, não precisa de outra.

`.form-row` (só a variante sem classe, usada exclusivamente por `Transacoes.tsx`) ganhou uma coluna:
`grid-template-columns` foi de 7 pra 8 tracks. Não mexe em `.form-row.pessoas`/`.form-row.categorias`.

**Passo 2 — editar/excluir transação avulsa**: `Transacoes.tsx` ganhou ícones editar/excluir + dois
`Modal`, mesmo padrão de `MinhaFamilia.tsx` (dependentes) e da antiga `Pessoas.tsx`.

⚠️ **`TransacaoResponseDto` só trazia `Pessoa`/`Categoria` como nome (string)**, sem o id — achado ao
desenhar o modal de editar: pré-selecionar a opção certa num formulário casando de volta pelo nome é
frágil (duas pessoas ou categorias podem ter o mesmo nome, nada impede isso). A API ganhou
`PessoaId`/`CategoriaId` na resposta (branch `transacao-response-inclui-ids`, mudança aditiva, sem
depender de nenhum dos 4 blocos — pura correção de uma lacuna que só apareceu na hora de construir a
tela). `types/Transacao.ts` reflete isso.

`types/Transacao.ts` também ganhou `serieId`/`numeroParcela`/`totalParcelas` (nullable) — a API já os
devolve desde o bloco 3, mesmo sem nenhum jeito de criar uma série pelo front ainda (isso é o Passo
3/4). O modal de editar/excluir já vem com o checkbox "aplicar/excluir também as futuras"
**condicional a `serieId != null`** — código pronto, mas inexercitável até o Passo 3 existir. Evita
ter que voltar no modal depois.

**Passo 3 — compra parcelada**: botão "Nova Compra Parcelada" ao lado de "Nova Transação", modal
próprio (`POST /transacoes/parceladas`). Badge "N/M" aparece na Descrição de toda linha com
`totalParcelas` — é aí que o checkbox "aplicar/excluir também as futuras" do Passo 2 passa a ter
efeito de verdade pela primeira vez.

- Tipo era sempre Despesa (`2`), fixo, sem select — **destravado no Passo 5** (ver abaixo), que
  também trocou o filtro de categoria de "sempre despesa" pra "conforme o Tipo escolhido".
- **Aviso de dia 29/30/31**: `diaPodeFaltarEmAlgunsMeses` usa `getUTCDate()`, não `getDate()` — a
  mesma cautela de fuso horário do bug do `formatDate` (ver Passo 1). Como `dataPrimeiraParcela` é
  uma string `"AAAA-MM-DD"` sem hora, `new Date(...)` a interpreta como UTC; ler com `getDate()`
  (hora local) podia devolver o dia errado perto da meia-noite em fuso atrás de UTC.

**Passo 4 (final) — salário quinzenal**: botão "Novo Salário", modal próprio (`POST
/transacoes/recorrencia-percentual`). Fecha o bloco de transações recorrentes/parceladas.

- `types/Categoria.ts` ganhou `aceitaDivisaoPercentual`. O front acha a categoria certa por
  `categorias.find(c => c.aceitaDivisaoPercentual)` — **nunca por nome** ("Salário"), mesmo
  raciocínio do backend. O botão "Novo Salário" só aparece se essa categoria existir; hoje é sempre
  a categoria de sistema seedada, mas some em vez de quebrar se um dia não existir.
- Sem select de Categoria no modal — só existe uma categoria com o flag, então o formulário nem
  pergunta. Escondida, não em `[Required]` disfarçado: se um dia mais de uma categoria tiver o
  flag, `categoriaSalario` pega a primeira encontrada, o que pode não ser a certa — não é um caso
  tratado, porque hoje é estruturalmente impossível (só o seed do sistema marca o flag).
- Formulário sempre pede **duas** ocorrências (dia + percentual cada), não uma lista dinâmica — a
  API aceita qualquer tamanho ≥ 2, mas o único caso de uso descrito até aqui é sempre duas partes
  ("35% na primeira quinzena, 75% no fim da segunda"). Dividir em mais de duas partes exigiria
  reabrir esta tela mais tarde.
- `mesReferencia` vem de `<input type="month">` (valor `"AAAA-MM"`) e vira `"AAAA-MM-01"` só na
  hora de montar o corpo da requisição — a API ignora o dia desse campo (cada ocorrência tem o
  próprio `Dia`), o `-01` é só pra virar uma string de data válida.
- Percentuais **não precisam somar 100** — o formulário não valida isso, de propósito (mesma
  decisão do backend: adiantamento e saldo podem vir de bases diferentes).

**Passo 5 — status Pago/Recebido** (bloco novo, plano `foamy-knitting-lightning.md`, branch
`pago-na-transacao` sobre `salario-quinzenal`): `types/Transacao.ts` ganha `pago: boolean`.

- **Toggle direto na tabela** (`alternarPago`): botão-badge (`.badge-btn`, classe nova em
  `app.css`) que chama `PATCH /transacoes/{id}/pago` sem abrir modal — verde ("Pago"/"Recebido",
  rótulo conforme `Tipo`) quando `pago`, âmbar ("Pendente") quando não. `.badge-btn` só reseta o
  chrome nativo de `<button>` (fonte, cursor) pra herdar a aparência das classes `.badge-*`
  existentes — a cor em si continua vindo de `badge-receita`/`badge-ambas`, reaproveitadas do badge
  de Tipo em vez de inventar uma paleta nova pra status.
- **Checkbox "Já pago"/"Já recebido"** (rótulo conforme `tipo`/`tipoEdicao`) no formulário de criar
  avulsa e no modal de editar, default marcado (`true`) — reflete o caso comum de registrar algo que
  já aconteceu. Vai junto no `POST /transacoes` e no `PATCH /transacoes/{id}`.
  - ⚠️ No formulário de criar (`.form-row`, grid de 8 tracks fixas — ver Passo 1), o checkbox usa
    `gridColumn: "1 / -1"` pra ocupar a linha inteira: é o 9º item do grid, e sem isso o botão
    Cancelar (auto-posicionado) cairia sozinho numa segunda linha.
- Séries (parcelas, ocorrências de salário) continuam nascendo com `Pago = false` no backend — não
  ganham campo novo nos modais de Compra Parcelada/Salário, é comportamento implícito da API.
- **Compra Parcelada passa a aceitar Receita**: select de Tipo novo no modal (`tipoParcelada`,
  default `2`/Despesa pra não mudar o caso comum). `categoriasDaParcelada` filtra por
  `finalidade === tipoParcelada || finalidade === FINALIDADE_AMBAS`, substituindo o filtro fixo
  "sempre despesa" do Passo 3. Trocar o Tipo limpa `categoriaIdParcelada`
  (`handleTipoParceladaChange`) — a categoria selecionada podia não existir mais na nova lista.

## Relatório Familiar (`src/pages/RelatorioFamiliar.tsx`, desde 2026-08-12)

Segunda página de relatório, focada em comparar pessoas entre si — o Dashboard (`Relatorio.tsx`)
já mostra receita/despesa por pessoa num gráfico, mas não saldo individual nem participação
percentual, e não tem o histórico de quem esteve na família.

- **Saldo por pessoa e participação % não pediram nada novo da API.** `/relatorios/totais-por-pessoa`
  já devolve `saldo` calculado por pessoa (`TotaisPessoaDto.Saldo` no backend); a % é só
  `valor / total` calculado aqui na página.
- **O histórico vem de `GET /familia/historico`**, endpoint novo — ver "Histórico da família" no
  `CLAUDE.md` da API. Mapeamento de badge por ação fica local à página (`classeBadgeHistorico`), não
  em `utils/badge.ts`: aquele arquivo só cobre o trio Receita/Despesa/Ambas, e as quatro ações do
  histórico (`CriacaoFamilia`, `EntradaFamilia`, `RemocaoMembro`, `ExclusaoConta`) são um domínio
  diferente, sem razão pra forçar as duas coisas no mesmo tipo.
- **Item de menu só aparece com `familia.membros.length > 1`** (`Layout.tsx`) — numa família de uma
  pessoa só, "participação de cada membro" não compara nada. A rota em si (`/painel/relatorio-familiar`)
  continua acessível por URL direta mesmo sem o item no menu; sem membro pra comparar, a página só
  mostra uma linha e um histórico curto, não quebra.

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
