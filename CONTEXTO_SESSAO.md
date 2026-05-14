# Contexto da Sessão — Lig Chopp Germânia · Sistema de Orçamentos

> Abra este arquivo em um novo chat para retomar o trabalho exatamente de onde parou.

---

## AGENTS.md (arquivo original do projeto)

```
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
```

---

## Visão geral do projeto

**Nome:** Lig Chopp Germânia — Sistema de Orçamentos  
**Diretório:** `C:\Users\felipe.silva\Desktop\GERMÂNIA\05 - MAIO\07 - SISTEMA DE ORÇAMENTOS\SISTEMA ORÇAMENTOS\lig-chopp`  
**URL local:** `http://localhost:3000`  
**Iniciar servidor:** `npm run dev` dentro do diretório acima

Sistema interno de orçamentos para vendedores da Central Lig Chopp Germânia. Permite criar orçamentos de chopp com cálculo de frete, seleção de loja mais próxima por CEP, e geração de PDF.

---

## Tech Stack

- **Next.js 16.2.5** (App Router, Turbopack) — `serverExternalPackages: ['@react-pdf/renderer']` em next.config.ts
- **React 19.2.4** + TypeScript
- **Tailwind CSS v4** (`@theme inline` para tokens de cor)
- **Fontes web (UI):** Adobe Typekit — `gotham` (body) e `bodega-sans` (display), via `<link>` no layout
  - `https://use.typekit.net/vlr1ohk.css` (gotham)
  - `https://use.typekit.net/yzj3pit.css` (bodega-sans)
- **Fontes PDF:** arquivos .ttf em `public/fonts/` (`gotham-medium.ttf`, `gotham_bold.otf`, `gotham_black.otf`, `Bodega Sans Black.ttf`)
- **PDF:** `@react-pdf/renderer` v4.5.1 — usar `dynamic(() => import(...), { ssr: false })`
- **Dados:** Google Sheets via CSV export, com cache em arquivo JSON
- **Geocoding:** AwesomeAPI → BrasilAPI v2 → Nominatim (cascata)

---

## Design System

### CSS Variables (`src/app/globals.css`)

```css
--bege: #fee6ce          /* fundo principal */
--vermelho: #c92b1f      /* cor primária / títulos */
--laranja: #f79946       /* botões de ação / destaques */
--marrom: #6c2d01        /* texto principal */
--bege-2: #8f7b65        /* texto secundário / bordas */
--bege-claro: #f5d9bd    /* fundo dos section cards */
--bege-3: #dec3a6        /* separadores */
--dourado: #ddbb52       /* pilsen circle */
--font-display: "bodega-sans"
--font-body: "gotham"
```

### Classes CSS de hover (todos com `!important`)

```css
.btn-laranja:hover:not(:disabled)   → bg vermelho, text bege
.btn-login:hover                    → bg laranja, text marrom, border laranja
.sidebar-nav-inactive:hover         → bg laranja, text marrom, border laranja
.sidebar-nav-active:hover           → bg laranja, text marrom
.sidebar-nav-btn:hover              → bg laranja, text marrom, border laranja
.sidebar-sair:hover                 → bg laranja, text marrom, border laranja
.btn-voltar:hover                   → bg vermelho, text bege, border vermelho
.btn-seta:hover                     → bg vermelho, text bege
.btn-ver:hover                      → bg vermelho, text bege
```

---

## Estrutura de arquivos relevantes

```
src/
  app/
    layout.tsx                   ← Typekit links, metadata
    globals.css                  ← design tokens, hover classes, print, th fix
    login/page.tsx               ← tela de login (btn-login class)
    dashboard/
      layout.tsx                 ← sidebar + main wrapper
      novo/page.tsx              ← formulário do vendedor
      meus/page.tsx              ← lista de orçamentos do vendedor
      coordenador/page.tsx       ← painel do coordenador
    api/
      cep/route.ts               ← geocoding CEP → loja mais próxima
      auth/logout/route.ts
  components/
    BudgetForm.tsx               ← formulário principal (5 blocos)
    ConfirmationView.tsx         ← tela de confirmação / pré-PDF
    FormBudgetPDFDocument.tsx    ← template do PDF (react-pdf)
    PDFDownloadButton.tsx        ← botão de download (client-only, usa PDFDownloadLink)
    DownloadIcon.tsx             ← ícone SVG de download (15×14px, fill="currentColor")
    StyledSelect.tsx             ← select estilizado reutilizável
    DatePicker.tsx               ← date picker customizado
    MeusOrcamentos.tsx           ← componente da tela de orçamentos do vendedor
    Sidebar.tsx                  ← navegação lateral
  lib/
    mockData.ts                  ← tipos + dados mock (MOCK_BUDGETS, CHOPP_STYLES)
    googleSheets.ts              ← fetch Google Sheets + cache memória/arquivo
    freight.ts                   ← cálculo de frete, haversine, formatCurrency
    storesGeoCache.json          ← cache de coordenadas por CEP de loja (98 lojas)
    storesFullCache.json         ← cache completo de lojas (nome+endereço+coords)
public/
  assets/
    LIG CHOPP_LIG CHOPP.png     ← logo PNG (fundo transparente)
    brasao.svg
  fonts/
    Bodega Sans Black.ttf
    gotham-medium.ttf
    gotham_bold.otf
    gotham_black.otf
```

---

## Estado atual de cada arquivo modificado

### `src/app/globals.css` — estado completo atual

```css
@import "tailwindcss";

@theme inline {
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --color-bege: #fee6ce;
  --color-vermelho: #c92b1f;
  --color-laranja: #f79946;
  --color-marrom: #6c2d01;
  --color-bege-2: #8f7b65;
  --color-bege-claro: #f5d9bd;
  --color-dourado: #ddbb52;
  --color-bege-3: #dec3a6;
}

:root {
  --font-display: "bodega-sans", sans-serif;
  --font-body: "gotham", sans-serif;
  --bege: #fee6ce; --vermelho: #c92b1f; --laranja: #f79946;
  --marrom: #6c2d01; --bege-2: #8f7b65; --bege-claro: #f5d9bd;
  --dourado: #ddbb52; --bege-3: #dec3a6;
}

body { background-color: var(--bege); color: var(--marrom); font-family: var(--font-body, sans-serif); }

@layer base { th { text-align: inherit; } }  /* fix: Tailwind v4 preflight sobrescreve th alignment */

.btn-laranja:hover:not(:disabled) { background-color: var(--vermelho) !important; color: var(--bege) !important; }
.btn-login:hover { background-color: var(--laranja) !important; color: var(--marrom) !important; border-color: var(--laranja) !important; }
.sidebar-nav-inactive:hover { background-color: var(--laranja) !important; color: var(--marrom) !important; border-color: var(--laranja) !important; }
.sidebar-nav-active:hover { background-color: var(--laranja) !important; color: var(--marrom) !important; }
.sidebar-nav-btn:hover { background-color: var(--laranja) !important; color: var(--marrom) !important; border-color: var(--laranja) !important; }
.sidebar-sair:hover { background-color: var(--laranja) !important; color: var(--marrom) !important; border-color: var(--laranja) !important; }
.btn-voltar:hover { background-color: var(--vermelho) !important; color: var(--bege) !important; border-color: var(--vermelho) !important; }
.btn-seta:hover { background-color: var(--vermelho) !important; color: var(--bege) !important; }
.btn-ver:hover { background-color: var(--vermelho) !important; color: var(--bege) !important; }

/* Date inputs, select hover, obs placeholder, print... (ver arquivo completo) */
```

### `src/components/FormBudgetPDFDocument.tsx` — estado atual (2026-05-12)

Template PDF completamente reescrito. Layout:
1. Header vermelho arredondado + logo centralizado
2. Info section: 2 colunas 50%/50% — cliente à esquerda, data/orçamento/pagamento à direita (sem `alignItems: 'flex-end'`)
3. Título "Orçamento" em BodegaSans
4. Tabela: 2 boxes (descrição | valor)
5. Total: spacer `<View flex:1 />` + label + box laranja compacto à direita
6. Notas: 5 itens, `marginBottom: 5`, `lineHeight: 1.5`

**Bugs corrigidos nesta sessão:**
- Info section overlap → removido `alignItems: 'flex-end'` de `infoRight`; usar `textAlign: 'right'` no estilo do Text
- Total box full-width → usar spacer `<View style={{ flex: 1 }} />` em vez de `justifyContent: 'flex-end'`
- Notas sobrepostas → `marginBottom: 5`, `lineHeight: 1.5` ✅ (confirmado)

### `src/components/ConfirmationView.tsx`
- Importa `DownloadIcon` de `@/components/DownloadIcon`
- Botão "← Voltar": classe `btn-voltar`
- Botão "Gerar orçamento em PDF": `<><DownloadIcon /> Gerar orçamento em PDF</>`

### `src/components/PDFDownloadButton.tsx`
- Usa `PDFDownloadLink` (renderiza como `<a>`, não `<button>`)
- Ícone: `<DownloadIcon />` + "Baixar PDF"
- Classe `btn-laranja` para hover

### `src/components/MeusOrcamentos.tsx`
- Botão "Ver →": classe `btn-ver`, `backgroundColor: var(--laranja)`, `color: var(--marrom)`
- Tabela: headers com classes estáticas (`text-left`, `text-right`, `text-center`)

### `src/app/dashboard/coordenador/page.tsx`
- Mesma estrutura do MeusOrcamentos, com coluna "Vendedor" adicional
- Botão "Ver →": mesma classe `btn-ver`

### `src/components/DownloadIcon.tsx`
- SVG 15×14px, `fill="currentColor"`, `display: block`, `flexShrink: 0`

---

## Quirks técnicos importantes

### react-pdf / yoga flexbox
- `flex: 1` em `<View>` sem largura explícita no pai é imprevisível
- `alignItems: 'flex-end'` em container coluna NÃO encolhe filhos `<Text>` — textos longos transbordam para a esquerda
- Para alinhar texto à direita: usar `textAlign: 'right'` no estilo do `<Text>`, sem `alignItems` no container
- Para empurrar conteúdo à direita em flex row: spacer `<View style={{ flex: 1 }} />`
- URL-encode espaços em `Font.register()`: `'Bodega%20Sans%20Black.ttf'`
- Fontes Adobe Typekit (CDN) NÃO funcionam — usar arquivos .ttf locais

### Tailwind v4
- Classes dinâmicas (template literals/ternários) NÃO são compiladas
- Preflight define `th { text-align: left }` — fix: `@layer base { th { text-align: inherit; } }` em globals.css

### SSR / Next.js
- `@react-pdf/renderer` exige `{ ssr: false }` no `dynamic()` e `serverExternalPackages` em next.config.ts

---

## Problema em aberto — CEP retorna erro

**Sintoma:** "Não foi possível localizar o endereço" para todos os CEPs.

**Diagnóstico:**
- BrasilAPI v2 retorna `location.coordinates: {}` vazio para maioria dos CEPs
- Nominatim pode estar rate-limitado
- AwesomeAPI adicionada como primária — ainda não confirmada

**Testar:** Abrir `http://localhost:3000/api/cep?cep=01310100` com servidor rodando.

---

## Funcionalidades já implementadas

| # | Feature | Status |
|---|---------|--------|
| 1 | Layout base (sidebar, topbar, rotas por papel) | ✅ |
| 2 | Formulário do vendedor (5 blocos) | ✅ |
| 3 | Cálculo de frete por CEP + loja mais próxima | ✅ (geocoding inconsistente) |
| 4 | ConfirmationView reescrita | ✅ |
| 5 | Template PDF customizado (FormBudgetPDFDocument) | ✅ (bugs de layout em ajuste) |
| 6 | PDFDownloadButton com ícone SVG | ✅ |
| 7 | Tela "Meus Orçamentos" do vendedor | ✅ |
| 8 | Painel do coordenador | ✅ |
| 9 | Drawer de detalhes + filtros nas tabelas | ✅ |
| 10 | Hover states padronizados (btn-ver, btn-voltar, etc.) | ✅ |
| 11 | Tabela: headers alinhados (th fix no globals.css) | ✅ |
| 12 | Integração RD Station CRM | ❌ pendente |
| 13 | Autenticação real | ❌ pendente |
| 14 | Geocoding de CEP funcionando em produção | ❌ pendente |

---

## Comandos úteis

```bash
# Iniciar servidor
cd "C:\Users\felipe.silva\Desktop\GERMÂNIA\05 - MAIO\07 - SISTEMA DE ORÇAMENTOS\SISTEMA ORÇAMENTOS\lig-chopp"
npm run dev

# Testar API de CEP
http://localhost:3000/api/cep?cep=01310100
```

---

## IDs das planilhas Google Sheets

- **Preços:** `18PBI3hbQVSfryDC7acUHRFJ_5bZ7cyX6Ragc81FLppA`
- **Lojas:** `1n11w5xTZZN54y0E1KxoyNZX-sNnHVHbkXc_t6lQW1Ik`

---

*Atualizado em 2026-05-12*
