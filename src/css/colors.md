# colors.md — Paleta e gradientes (Dashboard)

Este documento descreve **as cores e gradientes** do projeto (tokens CSS em `:root`) de forma **semântica** e **reutilizável**, para que outra IA consiga recriar um visual consistente (dark + blue neon) em novos componentes.

---

## 1) Identidade visual (resumo rápido)

**Clima geral:** dashboard dark (azul-marinho profundo) com acentos **azul elétrico** para ações e foco.  
**Contraste:** texto quase branco sobre superfícies escuras, com “muted” frio (azul-lavanda) para labels e microcopy.  
**Profundidade:** sombras bem suaves e “glow” azul em elementos primários.

---

## 2) Tokens base do dashboard (semânticos)

> Use estes tokens como “fonte de verdade” para o tema escuro.

### Superfícies (fundos)
- `--dash-surface: #0e0f30`  
  **Superfície principal** (cards, topbar, sidebar). É o “pano de fundo” dos containers.

- `--dash-surface-deep: #0c0d25`  
  **Fundo mais profundo** para canvas/área atrás de tudo (ou para variações de profundidade).

- `--dash-surface-accent: #1c2569`  
  **Superfície acentuada** para dar volume e destacar painéis (usado no gradiente do painel).

### Texto
- `--dash-text: #f4f6ff`  
  **Texto principal** (títulos, valores, botões).

- `--dash-text-muted: #b0b8e0`  
  **Texto secundário/muted** (subtítulos, labels, descrições).

### Ação / destaque (brand dentro do dashboard)
- `--dash-primary: #3d5bff`  
  **Ação primária** (botão principal, links, highlights).

- `--dash-secondary: #2c45d6`  
  **Ação secundária/alternativa** (botões alternativos, estados “pressed”).

- `--dash-ring: #5775ff`  
  **Cor de foco/outline** (ring de foco, bordas ativas).

### Bordas e neutros
- `--dash-border: #21244d`  
  **Borda sólida** (divisores, strokes mais definidos).

- `--dash-subtle: #26294f`  
  **Neutro sutil** (linhas, chips, separadores internos).

- `--dash-muted: #8a93c7`  
  **Neutro para conteúdo menos importante** (ícones secundários, textos terciários).

### Estados com transparência (interação / glass)
- `--dash-overlay: rgba(12, 13, 37, 0.7)`  
  **Overlay “glass escuro”** para camadas sobre superfícies (ex.: caixas dentro do painel).

- `--dash-active-bg: rgba(47, 91, 255, 0.2)`  
  **Fundo de item ativo/selecionado** (ex.: `.nav-item.active`).

- `--dash-border-subtle: rgba(79, 115, 255, 0.08)`  
  **Stroke/linha interna** muito discreta (ex.: contorno inset dos cards).

---

## 3) Efeitos (sombras e glow)

> Estes tokens não são “cores puras”, mas fazem parte do look & feel (profundidade e destaque).

- `--dash-shadow-elevated: 0 24px 50px rgba(7, 10, 32, 0.6)`  
  **Sombra de elevação forte** (topbar). Sugere um container “flutuando”.

- `--dash-glow-primary: 0 12px 24px rgba(47, 91, 255, 0.4)`  
  **Glow azul** para elementos primários (botão primary).

---

## 4) Gradientes (como e onde usar)

### 4.1 Gradiente do painel (principal do layout)
Token:
```css
--dash-panel-gradient: linear-gradient(
  to bottom right,
  var(--dash-surface) 0%,
  var(--dash-surface) 35%,
  var(--dash-surface-accent) 100%
);
