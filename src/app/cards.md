# Cards - Documentação Técnica

## 📊 Visão Geral

O sistema utiliza um componente de card modular (`OverviewCard`) para exibir métricas elétricas em todas as telas do dashboard. Este documento detalha a estrutura, implementação e uso dos cards em sua versão original.

---

## 🎨 Componente Base: OverviewCard

**Arquivo:** `src/app/(home)/_components/overview-cards/card.tsx`

### Estrutura Visual

```
┌─────────────────────────────────┐
│  🔌 Ícone (SVG)                │
│                                 │
│  220.87 V          ↑ 100.4%    │
│  Tensão A                       │
└─────────────────────────────────┘
```

### Interface TypeScript

```tsx
type PropsType = {
  label: string;  // Ex: "Tensão A", "Corrente Média"
  data: {
    value: number | string;              // Ex: "220.87 V", "15.2 A"
    growthRate: number;                  // Ex: 4.5 (para 4.5%)
    valueStyle?: CSSProperties;          // Estilo inline para o valor
    indicatorValue?: string;             // Ex: "100.4%" (sobrescreve growthRate%)
    indicatorIsDecreasing?: boolean;     // true = vermelho ↓, false = verde ↑
    indicatorStyle?: CSSProperties;      // Estilo inline para o indicador
    hideIndicator?: boolean;             // true = esconde o indicador %
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};
```

### Implementação Completa

```tsx
export function OverviewCard({ label, data, Icon }: PropsType) {
  const isDecreasing =
    data.indicatorIsDecreasing ?? data.growthRate < 0;
  const indicatorValue = data.indicatorValue ?? `${data.growthRate}%`;

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
      {/* Ícone no topo */}
      <Icon />

      {/* Conteúdo na parte inferior */}
      <div className="mt-6 flex items-end justify-between">
        {/* Lado esquerdo: Valor e Label */}
        <dl>
          <dt
            className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white"
            style={data.valueStyle}
          >
            {data.value}
          </dt>
          <dd className="text-sm font-medium text-dark-6">{label}</dd>
        </dl>

        {/* Lado direito: Indicador % */}
        {!data.hideIndicator && (
          <dl
            className={cn(
              "text-sm font-medium",
              isDecreasing ? "text-red" : "text-green",
            )}
            style={data.indicatorStyle}
          >
            <dt className="flex items-center gap-1.5">
              {indicatorValue}
              {isDecreasing ? (
                <ArrowDownIcon aria-hidden />
              ) : (
                <ArrowUpIcon aria-hidden />
              )}
            </dt>
            <dd className="sr-only">
              {label} {isDecreasing ? "Decreased" : "Increased"} by{" "}
              {indicatorValue}
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
}
```

### Classes Tailwind Utilizadas

| Elemento | Classes | Descrição |
|----------|---------|-----------|
| **Container** | `rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark` | Card com bordas arredondadas, padding 24px, sombra |
| **Layout interno** | `mt-6 flex items-end justify-between` | Flexbox com espaço entre elementos, alinhamento inferior |
| **Valor (dt)** | `mb-1.5 text-heading-6 font-bold text-dark dark:text-white` | Fonte grande (heading-6), negrito, cor escura |
| **Label (dd)** | `text-sm font-medium text-dark-6` | Fonte pequena, peso médio, cor cinza |
| **Indicador** | `text-sm font-medium` + `text-red` ou `text-green` | Cor dinâmica baseada em crescimento |

### Tamanhos de Fonte

- **`text-heading-6`**: ~28px (definido no Tailwind config)
- **`text-sm`**: 14px
- **`mb-1.5`**: margin-bottom 6px
- **`mt-6`**: margin-top 24px

---

## 🔌 Ícones dos Cards

**Arquivo:** `src/app/(home)/_components/overview-cards/icons.tsx`

### Ícones Disponíveis

```tsx
export {
  VoltageA,       // Tensão Fase A (roxo)
  VoltageB,       // Tensão Fase B (azul)
  VoltageC,       // Tensão Fase C (laranja)
  Voltage,        // Tensão genérica
  Current,        // Corrente
  Power,          // Potência
  PowerFactor,    // Fator de Potência
  PowerDirect,    // Potência Direta
  PowerReverse,   // Potência Reversa
  PowerReactive,  // Potência Reativa
  PowerComplex,   // Potência Complexa
  AngleCurrent,   // Ângulo de Corrente
  AngleVoltage,   // Ângulo de Tensão
  PhaseShift,     // Defasagem
}
```

### Estrutura dos Ícones

Todos os ícones seguem o mesmo padrão:

```tsx
export function VoltageA(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="fill-primary dark:fill-white"
      width="58"
      height="58"
      viewBox="0 0 58 58"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Paths do ícone */}
    </svg>
  );
}
```

**Características:**
- Largura/altura padrão: 58x58px
- Cor: `fill-primary` (roxo) no light mode, `fill-white` no dark mode
- Aceita props adicionais via spread operator

---

## 📍 Implementações por Tela

### 1. OverviewCardsGroup (Visão Geral)

**Arquivo:** `src/app/(home)/_components/overview-cards/index.tsx`  
**Rota:** `/` (home)  
**Cards:** 4 (Tensão A, Tensão B, Tensão C, Potência)

#### Características Especiais

**Cálculo de cor dinâmica para tensão:**

```tsx
const BASE_VOLTAGE = 220;
const MAX_DEVIATION_RATIO = 0.1;

const getVoltageColor = (value: number) => {
  const ratio = Math.abs(value - BASE_VOLTAGE) / BASE_VOLTAGE;
  const clamped = Math.min(ratio, MAX_DEVIATION_RATIO);
  const hue = 120 - (clamped / MAX_DEVIATION_RATIO) * 120;
  
  return `hsl(${hue} 80% 40%)`;
};
```

**Lógica:**
- Base: 220V
- Desvio máximo: 10% (22V)
- Cor verde (hue 120): tensão = 220V (ideal)
- Cor vermelha (hue 0): tensão com desvio de ±10% ou mais

**Formatação de tensão:**

```tsx
const formatVoltage = (rawValue: string) => {
  const numeric = Number.parseFloat(rawValue);
  
  if (!Number.isFinite(numeric)) {
    return {
      value: rawValue,
      indicatorValue: rawValue,
      indicatorIsDecreasing: false,
      indicatorStyle: undefined,
    };
  }
  
  const percent = (numeric / BASE_VOLTAGE) * 100;
  
  return {
    value: `${numeric.toFixed(2)} V`,
    indicatorValue: `${percent.toFixed(1)}%`,
    indicatorIsDecreasing: numeric < BASE_VOLTAGE,
    indicatorStyle: { color: getVoltageColor(numeric) },
  };
};
```

**Uso:**

```tsx
export async function OverviewCardsGroup() {
  const phaseConsumption = await getPhaseConsumptionData();
  const tensaoA = formatVoltage(phaseConsumption.TensaoA);
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Tensão A"
        data={{
          value: tensaoA.value,
          indicatorValue: tensaoA.indicatorValue,
          indicatorIsDecreasing: tensaoA.indicatorIsDecreasing,
          indicatorStyle: tensaoA.indicatorStyle,
          growthRate: 0,
        }}
        Icon={icons.VoltageA}
      />
      {/* ... outros cards */}
    </div>
  );
}
```

---

### 2. PhaseCards (Fase A/B/C, Trifásico)

**Arquivo:** `src/components/phase-dashboard/phase-cards.tsx`  
**Rotas:** `/fase-a`, `/fase-b`, `/fase-c`, `/trifasico`  
**Cards:** 4 (Corrente, Tensão, Potência, Fator de Potência)

#### Características

**Cálculo de média entre fases:**

```tsx
const averageMetric = (metric: Parameters<typeof getCurrentValue>[1]) => {
  const values = phasesToUse.map((phaseKey) => getCurrentValue(phaseKey, metric));
  const sum = values.reduce((total, value) => total + value, 0);
  return values.length > 0 ? sum / values.length : 0;
};
```

**Formatação de valores:**

```tsx
const formatValue = (value: number) => (
  Number.isInteger(value) ? value.toString() : value.toFixed(2)
);
```

**Uso:**

```tsx
export async function PhaseCards({ phase, phases }: PropsType) {
  const phasesToUse = phases && phases.length > 0 ? phases : [phase];
  await Promise.all(phasesToUse.map((phaseKey) => getPhaseData(phaseKey)));
  
  const corrente = averageMetric("corrente");
  const tensao = averageMetric("tensao");
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Corrente Média"
        data={{
          value: `${formatValue(corrente)} A`,
          growthRate: 0,
          hideIndicator: true,
        }}
        Icon={icons.Current}
      />
      {/* ... outros cards */}
    </div>
  );
}
```

**Props:**
- `phase`: Fase individual ("A" | "B" | "C")
- `phases?`: Array de fases para cálculo de média (usado em `/trifasico`)

---

### 3. PhaseInfo (Ângulos - Fase A/B/C)

**Arquivo:** `src/components/phase-dashboard/phase-info.tsx`  
**Rotas:** `/fase-a`, `/fase-b`, `/fase-c` (seção inferior)  
**Cards:** 3 (Ângulo de Corrente, Ângulo de Tensão, Defasagem)

#### Características

**Grid de 3 colunas:**

```tsx
<div className="grid gap-4 sm:grid-cols-3 sm:gap-6 2xl:gap-7.5">
```

**Uso:**

```tsx
export function PhaseInfo({ phase }: PropsType) {
  const faseInfo = getFaseInfo(phase);
  
  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-6 2xl:gap-7.5">
      <OverviewCard
        label="Ângulo de Corrente"
        data={{
          value: `${faseInfo.angulo_corrente}°`,
          growthRate: 0,
          hideIndicator: true,
        }}
        Icon={icons.AngleCurrent}
      />
      {/* ... outros cards */}
    </div>
  );
}
```

---

### 4. InfoGeraisCards (Informações Adicionais)

**Arquivo:** `src/app/informacoes-adicionais/_components/info-gerais-cards.tsx`  
**Rota:** `/informacoes-adicionais`  
**Cards:** 4 (Potência Direta, Reversa, Reativa, Complexa)

#### Características

**Formatação de potência com unidades diferentes:**

```tsx
const formatPower = (value: number, unit: string) =>
  `${standardFormat(value)} ${unit}`;
```

**Unidades:**
- **Direta/Reversa:** W (Watts)
- **Reativa:** Var (Volt-Ampere Reativo)
- **Complexa:** Va (Volt-Ampere)

**Uso com array de configuração:**

```tsx
export async function InfoGeraisCards() {
  const potencias = await getInfoGeraisPotencias();
  
  const cards = [
    {
      label: "Potência direta",
      value: formatPower(potencias.direta, "W"),
      Icon: icons.PowerDirect,
    },
    {
      label: "Potência reversa",
      value: formatPower(potencias.reversa, "W"),
      Icon: icons.PowerReverse,
    },
    {
      label: "Potência reativa",
      value: formatPower(potencias.reativa, "Var"),
      Icon: icons.PowerReactive,
    },
    {
      label: "Potência complexa",
      value: formatPower(potencias.complexa, "Va"),
      Icon: icons.PowerComplex,
    },
  ];
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      {cards.map((card) => (
        <OverviewCard
          key={card.label}
          label={card.label}
          data={{
            value: card.value,
            growthRate: 0,
            hideIndicator: true,
          }}
          Icon={card.Icon}
        />
      ))}
    </div>
  );
}
```

---

## 🎨 Layouts de Grid

### Grid Padrão (4 colunas)

```tsx
<div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
```

**Breakpoints:**
- Mobile (< 640px): 1 coluna, gap 16px
- Tablet (≥ 640px): 2 colunas, gap 24px
- Desktop (≥ 1280px): 4 colunas, gap 24px
- 2XL (≥ 1536px): 4 colunas, gap 30px

### Grid de 3 colunas (PhaseInfo)

```tsx
<div className="grid gap-4 sm:grid-cols-3 sm:gap-6 2xl:gap-7.5">
```

**Breakpoints:**
- Mobile (< 640px): 1 coluna, gap 16px
- Tablet+ (≥ 640px): 3 colunas, gap 24px
- 2XL (≥ 1536px): 3 colunas, gap 30px

---

## 🎯 Padrões de Uso

### Padrão 1: Card com Indicador Padrão

```tsx
<OverviewCard
  label="Tensão A"
  data={{
    value: "220.87 V",
    growthRate: 4.5,  // Mostra "4.5%" com seta verde ↑
  }}
  Icon={icons.VoltageA}
/>
```

### Padrão 2: Card sem Indicador

```tsx
<OverviewCard
  label="Potência"
  data={{
    value: "1500 W",
    growthRate: 0,
    hideIndicator: true,  // Esconde o indicador %
  }}
  Icon={icons.Power}
/>
```

### Padrão 3: Card com Indicador Customizado

```tsx
<OverviewCard
  label="Tensão A"
  data={{
    value: "220.87 V",
    growthRate: 0,
    indicatorValue: "100.4%",               // Texto customizado
    indicatorIsDecreasing: false,           // Seta verde ↑
    indicatorStyle: { color: "hsl(120 80% 40%)" },  // Cor customizada
  }}
  Icon={icons.VoltageA}
/>
```

### Padrão 4: Card com Estilo Inline no Valor

```tsx
<OverviewCard
  label="Tensão A"
  data={{
    value: "220.87 V",
    growthRate: 0,
    valueStyle: { color: "#22C55E", fontWeight: "900" },  // Verde e extra bold
    hideIndicator: true,
  }}
  Icon={icons.VoltageA}
/>
```

---

## 🔄 Fluxo de Dados

### 1. Visão Geral (OverviewCardsGroup)

```
getPhaseConsumptionData()
  ↓
consumo.json
  ↓
formatVoltage()
  ↓
OverviewCard (com indicatorStyle dinâmico)
```

### 2. Fase A/B/C (PhaseCards)

```
getPhaseData(phase)
  ↓
faseA.json / faseB.json / faseC.json
  ↓
getCurrentValue(phase, metric)
  ↓
averageMetric() (se múltiplas fases)
  ↓
formatValue()
  ↓
OverviewCard
```

### 3. Informações Adicionais (InfoGeraisCards)

```
getInfoGeraisPotencias()
  ↓
infoGerais-potencias.json
  ↓
formatPower(value, unit)
  ↓
OverviewCard
```

---

## 🎨 Temas (Dark Mode)

### Classes Responsivas ao Tema

```tsx
// Container
"bg-white dark:bg-gray-dark"

// Valor
"text-dark dark:text-white"

// Label
"text-dark-6"  // Mesma cor em ambos os temas

// Ícone
"fill-primary dark:fill-white"
```

### Variáveis de Cor (tailwind.config.ts)

```ts
colors: {
  primary: "#5750F1",     // Roxo
  dark: "#111928",        // Quase preto
  "dark-6": "#64748B",    // Cinza médio
  "gray-dark": "#1F2937", // Cinza escuro (dark mode bg)
  red: "#EF4444",         // Vermelho
  green: "#22C55E",       // Verde
}
```

---

## 📊 Métricas e Unidades

| Tipo | Unidade | Exemplo | Formatação |
|------|---------|---------|------------|
| **Tensão** | V (Volts) | `220.87 V` | `.toFixed(2)` |
| **Corrente** | A (Amperes) | `15.2 A` | `.toFixed(2)` ou inteiro |
| **Potência** | W (Watts) | `1,500.00 W` | `standardFormat()` |
| **Potência Reativa** | Var | `800.00 Var` | `standardFormat()` |
| **Potência Complexa** | Va | `1,800.00 Va` | `standardFormat()` |
| **Fator de Potência** | adimensional | `0.95` | `.toFixed(2)` ou inteiro |
| **Ângulos** | ° (graus) | `30°` | inteiro |
| **Percentual** | % | `100.4%` | `.toFixed(1)` |

---

## 🧩 Funções Auxiliares

### standardFormat (lib/format-number.ts)

```tsx
export function standardFormat(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
```

**Uso:** `standardFormat(1500)` → `"1.500,00"`

### cn (lib/utils.ts)

```tsx
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Uso:** Combina classes Tailwind sem conflitos

---

## ♿ Acessibilidade

### Estrutura Semântica

```tsx
<dl>
  <dt>{value}</dt>
  <dd>{label}</dd>
</dl>
```

**Uso de `<dl>` (Definition List):**
- `<dt>`: Termo (valor da métrica)
- `<dd>`: Descrição (label da métrica)

### Screen Reader Support

```tsx
<dd className="sr-only">
  {label} {isDecreasing ? "Decreased" : "Increased"} by {indicatorValue}
</dd>
```

**Exemplo:** "Tensão A Increased by 100.4%"

### ARIA Labels

```tsx
<ArrowDownIcon aria-hidden />
<ArrowUpIcon aria-hidden />
```

Ícones decorativos marcados como `aria-hidden` para não serem lidos por screen readers.

---

## 🎨 Design System

### Hierarquia Visual

1. **Ícone** (topo): Identificação visual rápida
2. **Valor** (destaque): Maior tamanho, negrito, cor escura
3. **Label** (secundário): Tamanho menor, peso médio, cor cinza
4. **Indicador** (contexto): Cor verde/vermelho, tamanho pequeno

### Espaçamentos

```
┌─────────────────────────────────┐
│ padding: 24px (p-6)             │
│  🔌 Ícone                       │
│     ↓ 24px (mt-6)               │
│  220.87 V          ↑ 100.4%    │
│     ↓ 6px (mb-1.5)              │
│  Tensão A                       │
└─────────────────────────────────┘
```

### Cores de Estado

- **Normal:** `text-dark` / `text-dark-6`
- **Sucesso:** `text-green` (crescimento positivo)
- **Erro:** `text-red` (crescimento negativo)
- **Customizado:** via `indicatorStyle` ou `valueStyle`

---

## 🚀 Exemplos Práticos

### Exemplo 1: Card Simples (sem indicador)

```tsx
<OverviewCard
  label="Corrente Média"
  data={{
    value: "15.2 A",
    growthRate: 0,
    hideIndicator: true,
  }}
  Icon={icons.Current}
/>
```

### Exemplo 2: Card com Cor Dinâmica

```tsx
const tensaoA = formatVoltage("218.5");  // Abaixo de 220V

<OverviewCard
  label="Tensão A"
  data={{
    value: tensaoA.value,              // "218.50 V"
    indicatorValue: tensaoA.indicatorValue,  // "99.3%"
    indicatorIsDecreasing: true,       // Seta vermelha ↓
    indicatorStyle: { color: "hsl(115 80% 40%)" },  // Amarelado
    growthRate: 0,
  }}
  Icon={icons.VoltageA}
/>
```

### Exemplo 3: Array de Cards

```tsx
const metricas = [
  { label: "Corrente", value: "15.2 A", Icon: icons.Current },
  { label: "Tensão", value: "220.8 V", Icon: icons.Voltage },
  { label: "Potência", value: "3,360 W", Icon: icons.Power },
];

return (
  <div className="grid gap-4 sm:grid-cols-3">
    {metricas.map((m) => (
      <OverviewCard
        key={m.label}
        label={m.label}
        data={{ value: m.value, growthRate: 0, hideIndicator: true }}
        Icon={m.Icon}
      />
    ))}
  </div>
);
```

---

## 🔍 Comparação: Antes vs Depois (ScrollableCards)

### ❌ ANTES: Implementação Original

```tsx
// Cada tela tinha sua própria implementação
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <OverviewCard label="..." data={{...}} Icon={...} />
  <OverviewCard label="..." data={{...}} Icon={...} />
  <OverviewCard label="..." data={{...}} Icon={...} />
  <OverviewCard label="..." data={{...}} Icon={...} />
</div>
```

**Problemas:**
- ❌ Overflow horizontal no mobile
- ❌ Código duplicado em 5+ componentes
- ❌ Difícil manter consistência

### ✅ DEPOIS: ScrollableCards (Componente Modular)

**Nota:** Este é o sistema refatorado que foi implementado posteriormente. A documentação acima descreve a **versão original** antes da refatoração.

---

## 📝 Checklist de Implementação

Ao criar um novo card:

- [ ] Definir tipo de métrica (tensão, corrente, potência, etc.)
- [ ] Escolher ícone apropriado do `icons.tsx`
- [ ] Determinar se precisa de indicador %
- [ ] Definir unidade correta (V, A, W, Var, Va, °)
- [ ] Aplicar formatação adequada (`.toFixed()`, `standardFormat()`)
- [ ] Considerar cor dinâmica se aplicável
- [ ] Testar em dark mode
- [ ] Verificar acessibilidade (dt/dd, sr-only)
- [ ] Testar responsividade (mobile, tablet, desktop)

---

## 📚 Arquivos Relacionados

### Componentes
- `src/app/(home)/_components/overview-cards/card.tsx` - Componente base
- `src/app/(home)/_components/overview-cards/icons.tsx` - Ícones SVG
- `src/app/(home)/_components/overview-cards/index.tsx` - OverviewCardsGroup
- `src/components/phase-dashboard/phase-cards.tsx` - PhaseCards
- `src/components/phase-dashboard/phase-info.tsx` - PhaseInfo
- `src/app/informacoes-adicionais/_components/info-gerais-cards.tsx` - InfoGeraisCards

### Serviços
- `src/services/phase-consumption.services.ts` - Dados de consumo por fase
- `src/services/phase-data.services.ts` - Dados de fases individuais
- `src/services/info-gerais.services.ts` - Informações gerais de potência

### Utilitários
- `src/lib/format-number.ts` - Formatação de números
- `src/lib/utils.ts` - Função `cn()` para classes

### Dados JSON
- `src/data/consumo.json` - Consumo geral
- `src/data/faseA.json`, `faseB.json`, `faseC.json` - Dados por fase
- `src/data/infoGerais-potencias.json` - Potências

---

## 🎯 Princípios de Design

1. **Consistência:** Todos os cards seguem a mesma estrutura visual
2. **Hierarquia:** Valor > Label > Indicador
3. **Clareza:** Unidades sempre visíveis, formatação padronizada
4. **Responsividade:** Grid adaptável para mobile, tablet, desktop
5. **Acessibilidade:** Estrutura semântica, suporte a screen readers
6. **Temas:** Suporte a dark/light mode nativo
7. **Flexibilidade:** Props permitem customização quando necessário
8. **Performance:** Server Components para fetching, Client Components mínimos

---

**Versão:** Original (antes da refatoração ScrollableCards)  
**Data:** Janeiro 2026  
**Status:** ✅ Documentação Completa
