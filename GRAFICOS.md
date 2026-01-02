# Gráficos - Documentação Técnica Detalhada

## 📊 Visão Geral

O sistema de monitoramento de energia utiliza a biblioteca **ApexCharts** (versão 5.3.6) integrada ao React através do wrapper **react-apexcharts** (versão 1.7.0) para visualização de dados elétricos em tempo real.

### Biblioteca Utilizada: ApexCharts

**ApexCharts** é uma biblioteca JavaScript moderna e interativa para criação de gráficos, escolhida por:

- ✅ **Responsividade nativa**: Adapta-se automaticamente a diferentes tamanhos de tela
- ✅ **Interatividade**: Zoom, pan, tooltip, seleção de dados
- ✅ **Performance**: Renderização otimizada para grandes volumes de dados
- ✅ **TypeScript Support**: Tipagem completa com `ApexOptions`
- ✅ **Temas**: Suporte a dark/light mode
- ✅ **Variedade**: Linha, área, barra, donut, radial, etc.

**Versões:**
```json
{
  "apexcharts": "^5.3.6",
  "react-apexcharts": "^1.7.0"
}
```

**Importação:**
```tsx
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false, // Desabilita SSR para evitar problemas com window
});
```

---

## 📈 Tipos de Gráficos Implementados

### 1. **Gráfico de Área (Area Chart)**
**Arquivo:** `src/components/Charts/payments-overview/chart.tsx`  
**Usado em:** Visão Geral, Gráficos, Fase A/B/C, Trifásico

#### Características Técnicas

```tsx
type: "area"
curve: "smooth"
height: 310px
```

#### Configuração Completa

```tsx
const options: ApexOptions = {
  legend: {
    show: false, // Legenda desabilitada
  },
  colors: ["#5750F1", "#0ABEF9"], // Azul e Ciano
  chart: {
    height: 310,
    type: "area",
    toolbar: {
      show: false, // Remove toolbar de download
    },
    zoom: {
      enabled: !isMobile, // Desabilita no mobile para permitir scroll da página
      type: "x",
      autoScaleYaxis: true, // Ajusta Y ao fazer zoom
    },
    selection: {
      enabled: !isMobile, // Desabilita no mobile para permitir scroll da página
    },
    fontFamily: "inherit", // Usa fonte do Tailwind
  },
  fill: {
    gradient: {
      opacityFrom: 0.55, // Degradê de 55% opaco
      opacityTo: 0, // Para 0% transparente
    },
  },
  stroke: {
    curve: "smooth", // Linhas suaves
    width: isMobile ? 2 : 3, // Responsivo
  },
  grid: {
    strokeDashArray: 5, // Grade pontilhada
    yaxis: {
      lines: { show: true },
    },
  },
  dataLabels: {
    enabled: false, // Sem labels nos pontos
  },
  xaxis: {
    tickAmount: 12, // Máximo 12 ticks
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      rotate: -45, // Rotação de labels
      rotateAlways: true,
    },
  },
};
```

#### Breakpoints Responsivos

```tsx
responsive: [
  {
    breakpoint: 1024, // Tablet
    options: {
      chart: { height: 300 },
    },
  },
  {
    breakpoint: 1366, // Desktop pequeno
    options: {
      chart: { height: 320 },
    },
  },
],
```

#### Dados de Entrada

```tsx
series: {
  name: string; // Ex: "Fase A"
  data: { x: unknown; y: number }[]; // Ex: [{x: "00:00", y: 220.5}]
}[]
```

#### Uso

```tsx
<PaymentsOverviewChart 
  series={[
    { name: "Fase A", data: [...] },
    { name: "Fase B", data: [...] },
  ]} 
  colors={["#5750F1", "#0ABEF9", "#F2994A"]}
/>
```

---

### 2. **Gráfico de Linha (Line Chart)**
**Arquivo:** `src/components/Charts/info-gerais/chart.tsx`  
**Usado em:** Informações Adicionais

#### Características Técnicas

```tsx
type: "line"
curve: "smooth"
height: 320px
```

#### Diferenças do Area Chart

1. **Sem preenchimento (fill)**: Apenas linhas, sem área sombreada
2. **Legenda visível**: Mostra no topo
3. **Marcadores hover**: Pontos aparecem ao passar mouse
4. **Tooltip customizado**: Mostra unidades diferentes (W, Var, Va)

#### Configuração Única

```tsx
const options: ApexOptions = {
  legend: {
    show: true, // ← Diferença: legenda ativada
    position: "top",
    horizontalAlign: "left",
    fontFamily: "inherit",
    fontWeight: 500,
    fontSize: "14px",
    markers: {
      size: 9,
      shape: "circle",
    },
  },
  colors: ["#5750F1", "#0ABEF9", "#22C55E"], // 3 cores
  markers: {
    size: 0, // Escondidos por padrão
    hover: {
      sizeOffset: 4, // Aparecem no hover
    },
  },
  tooltip: {
    y: {
      formatter: (value, { seriesIndex, w }) => {
        const seriesName = w?.config?.series?.[seriesIndex]?.name;
        const unit = getUnitForSeries(seriesName);
        return `${value.toFixed(2)} ${unit}`;
      },
    },
  },
};
```

#### Função de Unidades Dinâmicas

```tsx
const getUnitForSeries = (seriesName?: string) => {
  const name = seriesName?.toLowerCase() ?? "";
  
  if (name.includes("reativa")) return "Var"; // Potência reativa
  if (name.includes("complexa")) return "Va";  // Potência complexa
  return "W"; // Potência ativa (padrão)
};
```

#### Uso

```tsx
<InfoGeraisLineChart 
  series={[
    { name: "Potência Ativa", data: [...] },
    { name: "Potência Reativa", data: [...] },
    { name: "Potência Complexa", data: [...] },
  ]} 
  colors={["#5750F1", "#0ABEF9", "#22C55E"]}
/>
```

---

### 3. **Gráfico de Barras (Bar Chart)**
**Arquivo:** `src/app/fase-a/_components/energy-chart.tsx`  
**Usado em:** Fase A/B/C (comparação anual)

#### Características Técnicas

```tsx
type: "bar"
horizontal: false
columnWidth: "35%"
borderRadius: 3
```

#### Configuração Completa

```tsx
const options: ApexOptions = {
  colors: ["#5750F1", "#0ABEF9"], // Ano Atual vs Ano Anterior
  chart: {
    type: "bar",
    stacked: false, // Barras lado a lado
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  plotOptions: {
    bar: {
      horizontal: false, // Barras verticais
      borderRadius: 3, // Cantos arredondados
      columnWidth: "35%", // Largura das colunas
      borderRadiusApplication: "end", // Apenas topo arredondado
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    strokeDashArray: 5,
    xaxis: { lines: { show: false } }, // Sem linhas verticais
    yaxis: { lines: { show: true } },  // Com linhas horizontais
  },
  xaxis: {
    categories: ["Jan", "Fev", "Mar", ...], // Meses
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontFamily: "inherit",
    fontWeight: 500,
    fontSize: "14px",
    markers: {
      size: 9,
      shape: "circle",
    },
  },
  fill: {
    opacity: 1, // Barras sólidas
  },
};
```

#### Responsividade

```tsx
responsive: [
  {
    breakpoint: 1536, // 2xl
    options: {
      plotOptions: {
        bar: {
          borderRadius: 3,
          columnWidth: "35%",
        },
      },
    },
  },
],
```

#### Dados de Entrada

```tsx
series: [
  {
    name: "Ano Atual",
    data: [450, 520, 480, 600, ...], // Valores mensais
  },
  {
    name: "Ano Passado",
    data: [420, 500, 460, 580, ...],
  },
]
```

#### Uso

```tsx
<EnergyChart 
  categories={["Jan", "Fev", "Mar", ...]}
  anoAtual={[450, 520, 480, ...]}
  anoAnterior={[420, 500, 460, ...]}
/>
```

---

### 4. **Gráfico de Donut (Donut Chart)**
**Arquivo:** `src/components/Charts/used-devices/chart.tsx`  
**Usado em:** Comparação de dispositivos/consumos

#### Características Técnicas

```tsx
type: "donut"
donutSize: "80%"
labels: show (center)
```

#### Configuração Completa

```tsx
const chartOptions: ApexOptions = {
  chart: {
    type: "donut",
    fontFamily: "inherit",
  },
  colors: ["#0ABEF9", "#22C55E", "#F59E0B"], // Ciano, Verde, Laranja
  labels: data.map((item) => item.name), // Ex: ["Desktop", "Mobile", "Tablet"]
  legend: {
    show: true,
    position: "bottom",
    itemMargin: {
      horizontal: 10,
      vertical: 5,
    },
    formatter: (legendName, opts) => {
      const { seriesPercent } = opts.w.globals;
      const percent = Math.round(seriesPercent[opts.seriesIndex]);
      return `${legendName}: ${percent}%`;
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "80%", // Tamanho do buraco central
        background: "transparent",
        labels: {
          show: true,
          total: {
            show: true,
            showAlways: true,
            label: "Total (kWh)",
            fontSize: "16px",
            fontWeight: "400",
          },
          value: {
            show: true,
            fontSize: "28px",
            fontWeight: "bold",
            formatter: (val) => `${compactFormat(+val)} kWh`,
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: false, // Sem labels nas fatias
  },
};
```

#### Responsividade Donut

```tsx
responsive: [
  {
    breakpoint: 2600,
    options: { chart: { width: 415 } },
  },
  {
    breakpoint: 640, // Mobile
    options: { chart: { width: "100%" } },
  },
  {
    breakpoint: 370, // Mobile pequeno
    options: { chart: { width: 260 } },
  },
],
```

#### Formatter Customizado

```tsx
import { compactFormat } from "@/lib/format-number";

value: {
  formatter: (val) => `${compactFormat(+val)} kWh`,
  // 1500 → "1.5k kWh"
  // 1500000 → "1.5M kWh"
}
```

#### Dados de Entrada

```tsx
data: { name: string; amount: number }[]
// Ex: [
//   { name: "Fase A", amount: 1500 },
//   { name: "Fase B", amount: 1200 },
//   { name: "Fase C", amount: 1800 },
// ]
```

#### Uso

```tsx
<DonutChart 
  data={[
    { name: "Desktop", amount: 1500 },
    { name: "Mobile", amount: 1200 },
    { name: "Tablet", amount: 800 },
  ]}
/>
```

---

### 5. **Gráfico de Barras Simples (Campaign Visitors)**
**Arquivo:** `src/components/Charts/campaign-visitors/chart.tsx`  
**Usado em:** Comparações semanais

#### Características Técnicas

```tsx
type: "bar"
columnWidth: "40%"
height: 230px
```

#### Configuração Simplificada

```tsx
const options: ApexOptions = {
  colors: ["#5750F1"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "bar",
    height: 200,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "40%",
      borderRadius: 3,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 4,
    colors: ["transparent"], // Remove borda das barras
  },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: {
    strokeDashArray: 7,
    yaxis: { lines: { show: true } },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    x: { show: false }, // Esconde tooltip do eixo X
  },
};
```

#### Dados de Entrada

```tsx
data: { x: string; y: number }[]
// Ex: [
//   { x: "M", y: 168 },
//   { x: "T", y: 385 },
//   ...
// ]
```

---

## 🎨 Paleta de Cores do Sistema

```tsx
// Cores Primárias
const CHART_COLORS = {
  primary: "#5750F1",    // Roxo (Fase A)
  secondary: "#0ABEF9",  // Ciano (Fase B)
  tertiary: "#F2994A",   // Laranja (Fase C)
  success: "#22C55E",    // Verde
  warning: "#F59E0B",    // Amarelo
};

// Gradientes (Donut Chart)
const DONUT_GRADIENT = [
  "#5750F1", // Roxo escuro
  "#5475E5", // Roxo médio
  "#8099EC", // Roxo claro
  "#ADBCF2", // Roxo muito claro
];
```

---

## 🔧 Utilitários e Helpers

### Hook useIsMobile

```tsx
// src/hooks/use-mobile.ts
import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
```

**Uso:**
```tsx
const isMobile = useIsMobile();
stroke: { width: isMobile ? 2 : 3 }
```

### Format Number

```tsx
// src/lib/format-number.ts
export function compactFormat(value: number): string {
  const formatter = Intl.NumberFormat("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
  });
  return formatter.format(value);
}

export function standardFormat(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
```

**Exemplos:**
- `compactFormat(1500)` → `"1,5 mil"`
- `compactFormat(1500000)` → `"1,5 mi"`
- `standardFormat(1234.56)` → `"1.234,56"`

---

## 📦 Componentes de Wrapper

### GraficosChart (Multi-Fase)

**Arquivo:** `src/app/graficos/_components/graficos-chart.tsx`

```tsx
type Props = {
  title: string;
  metric: PhaseMetrics; // "current" | "voltage" | "power" | "powerFactor"
  timeFrame?: string;    // "diario" | "semanal"
  sectionKey: string;
  className?: string;
  compact?: boolean;
};

export function GraficosChart({ title, metric, timeFrame, ... }: Props) {
  const resolvedTimeFrame = TIMEFRAME_MAP[timeFrame] ?? "day";
  const phases = ["A", "B", "C"] as const;
  
  const series = phases.map((phase) => ({
    name: `Fase ${phase}`,
    data: getChartSeries(phase, metric, resolvedTimeFrame),
  }));

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
      <div className="flex items-center justify-between">
        <h2>{title} ({timeFrame})</h2>
        <PeriodPicker 
          defaultValue={timeFrame}
          items={["diario", "semanal"]}
        />
      </div>
      
      <PaymentsOverviewChart 
        series={series} 
        colors={["#5750F1", "#0ABEF9", "#F2994A"]}
      />
    </div>
  );
}
```

**Usado em:**
- `/graficos` - Exibe 4 gráficos (Tensão, Corrente, Potência, FP)
- `/fase-a`, `/fase-b`, `/fase-c` - Gráfico individual por fase

### ConsumoPorFaseLine

**Arquivo:** `src/components/Charts/consumo-por-fase-line/index.tsx`

```tsx
export async function ConsumoPorFaseLine({
  timeFrame = "semanal",
  title = "Consumos por fase",
  ...
}: PropsType) {
  const series = await getConsumoPorFaseLinha(period);
  
  // Calcula totais para o resumo
  const summaryItems = series.map((item) => ({
    label: item.name,
    value: `${standardFormat(
      item.data.reduce((acc, point) => acc + point.y, 0)
    )} kWh`,
  }));

  return (
    <div>
      <PaymentsOverviewChart series={series} />
      
      {/* Grid de resumo */}
      <dl className="grid sm:grid-cols-3 divide-x">
        {summaryItems.map((item) => (
          <div key={item.label}>
            <dt>{item.value}</dt>
            <dd>{item.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

**Integração com serviços:**
```tsx
// src/services/consumo-por-fase-linha.services.ts
export async function getConsumoPorFaseLinha(
  period: "diario" | "semanal"
): Promise<Series[]> {
  const file = period === "diario" 
    ? "consumo-por-fase-diario.json"
    : "consumo-por-fase-semanal.json";
  
  const data = await import(`@/data/${file}`);
  return data.series;
}
```

---

## 📊 Mapeamento de Gráficos por Tela

| Tela | Gráfico(s) | Tipo | Componente |
|------|-----------|------|------------|
| **Visão Geral** | 4 gráficos (Tensão, Corrente, Potência, FP) | Area | `GraficosChart` |
| **Fase A/B/C** | Gráfico de métricas | Area | `PhaseChart` |
| **Fase A/B/C** | Comparação anual | Bar | `PhaseEnergyChart` → `EnergyChart` |
| **Trifásico** | Gráfico combinado 3 fases | Area | `PhaseChart` (3 séries) |
| **Gráficos** | 4 gráficos (Tensão, Corrente, Potência, FP) | Area | `GraficosChart` |
| **Informações Adicionais** | Potências (Ativa, Reativa, Complexa) | Line | `InfoGeraisLineChart` |
| **Consumo** | Consumo por fase | Area | `ConsumoPorFaseLine` |
| **Charts (demo)** | Used Devices | Donut | `ChartThree` |
| **Charts (demo)** | Campaign Visitors | Bar | `ChartFive` |

---

## 🎯 Padrões de Implementação

### Pattern 1: Dynamic Import (SSR Safe)

```tsx
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false, // CRÍTICO: ApexCharts usa `window`
});
```

**Por quê?**  
Next.js 15 renderiza no servidor por padrão. ApexCharts precisa do objeto `window`, que não existe no servidor. O `dynamic import` com `ssr: false` garante que o componente só seja carregado no cliente.

### Pattern 2: Responsive Width Calculations

```tsx
const isMobile = useIsMobile();

stroke: {
  width: isMobile ? 2 : 3, // Linhas mais finas no mobile
}
```

### Pattern 3: Adaptive Tick Amount

```tsx
const maxXTicks = 12;
const dataPoints = series.reduce(
  (max, item) => Math.max(max, item.data.length),
  0,
);
const xTickAmount = dataPoints > 0 
  ? Math.min(maxXTicks, dataPoints) 
  : maxXTicks;

xaxis: {
  tickAmount: xTickAmount, // Ajusta automaticamente
}
```

**Lógica:**
- Se houver 50 pontos, mostra apenas 12 ticks (evita poluição visual)
- Se houver 5 pontos, mostra 5 ticks

### Pattern 4: Negative Margin Hack

```tsx
<div className="-ml-4 -mr-5 h-[310px]">
  <Chart options={options} series={series} />
</div>
```

**Por quê?**  
ApexCharts adiciona padding interno. A margem negativa compensa e alinha o gráfico com o container.

### Pattern 5: Server Component + Client Chart

```tsx
// Server Component (pode usar async/await)
export async function PhaseChart({ phase, metric }: Props) {
  const data = await getChartSeries(phase, metric, "day"); // Server-side fetch
  
  return (
    <div>
      <PaymentsOverviewChart series={data} /> {/* Client Component */}
    </div>
  );
}
```

**Vantagens:**
- Fetching no servidor (mais rápido)
- Componente de gráfico no cliente (interatividade)

---

## 🚀 Performance e Otimizações

### 1. Dynamic Import

```tsx
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
```
- **Bundle size:** ApexCharts só carrega no cliente
- **Initial load:** Reduz JS inicial

### 2. Memoization (se necessário)

```tsx
const memoizedOptions = useMemo(() => ({
  chart: { type: "area" },
  colors: ["#5750F1"],
  // ... resto das opções
}), []); // Recalcula apenas se dependências mudarem
```

### 3. Lazy Loading de Dados

```tsx
export async function PhaseChart({ phase }: Props) {
  const data = await getChartSeries(phase, "voltage", "day");
  // Fetching server-side, sem impacto no bundle
}
```

### 4. Debounce no Zoom

```tsx
chart: {
  events: {
    zoomed: debounce((chartContext, { xaxis }) => {
      // Processa zoom apenas após 300ms de inatividade
    }, 300),
  },
}
```

---

## 🐛 Troubleshooting

### Problema: Scroll vertical não funciona no mobile ao tocar no gráfico

**Solução Implementada: Sistema de Foco Interativo**

No mobile, o zoom é controlado por um sistema de foco:
- **Tap (clique rápido)** no gráfico: Ativa/desativa o foco
- **Quando em foco**: Zoom por pinch habilitado, borda azul visível, badge "Zoom ativo"
- **Quando sem foco**: Scroll normal da página funciona
- **Arrastar**: Não ativa o foco, permitindo scroll natural

```tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useRef } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function MyChart({ series }: Props) {
  const isMobile = useIsMobile();
  const [isChartFocused, setIsChartFocused] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const options: ApexOptions = {
    chart: {
      zoom: {
        enabled: isMobile ? isChartFocused : true, // Mobile: só com foco
        type: "x",
        autoScaleYaxis: true,
      },
      selection: {
        enabled: isMobile ? isChartFocused : true, // Mobile: só com foco
      },
    },
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Tap: movimento < 10px e tempo < 300ms
    const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 300;

    if (isTap) {
      setIsChartFocused((prev) => !prev);
    }
  };

  const handleClickOutside = () => {
    if (isMobile && isChartFocused) {
      setIsChartFocused(false);
    }
  };

  return (
    <>
      {/* Overlay para clicar fora e desfocar */}
      {isMobile && isChartFocused && (
        <div
          className="fixed inset-0 z-10"
          onClick={handleClickOutside}
          onTouchStart={handleClickOutside}
        />
      )}
      
      <div
        className={`relative transition-all ${
          isChartFocused ? "z-20 ring-2 ring-primary rounded-lg" : ""
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Chart options={options} series={series} type="area" height={310} />
        
        {/* Badge indicador */}
        {isMobile && isChartFocused && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
            Zoom ativo
          </div>
        )}
      </div>
    </>
  );
}
```

**Comportamento:**
- 📱 **Mobile sem foco**: Scroll vertical funciona normalmente
- 🔍 **Mobile com foco**: Zoom por pinch (dois dedos) habilitado
- 🖥️ **Desktop**: Zoom sempre disponível (arrastar área com mouse)
- 👆 **Tap vs Drag**: Detecta diferença entre toque rápido e arrasto
- 🎯 **Feedback visual**: Borda azul + badge quando gráfico está em foco

---

### Erro: "window is not defined"

**Causa:** ApexCharts tentando acessar `window` no servidor.

**Solução:**
```tsx
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false, // ← Adicionar isso
});
```

### Gráfico não renderiza

**Checklist:**
1. ✅ `series` não está vazio?
2. ✅ `data` array tem estrutura correta `{ x, y }`?
3. ✅ `height` está definido?
4. ✅ Dynamic import está correto?

### Tooltip não aparece

**Verificar:**
```tsx
tooltip: {
  enabled: true, // Padrão é true
  marker: { show: true },
}
```

### Labels cortados no mobile

**Solução:**
```tsx
xaxis: {
  labels: {
    rotate: -45,
    rotateAlways: true,
    style: {
      fontSize: '12px',
    },
  },
}
```

---

## 📚 Referências

### Documentação Oficial
- [ApexCharts Docs](https://apexcharts.com/docs/)
- [React ApexCharts](https://github.com/apexcharts/react-apexcharts)
- [ApexCharts Options](https://apexcharts.com/docs/options/)

### Exemplos no Projeto
- Area Chart: `src/components/Charts/payments-overview/chart.tsx`
- Line Chart: `src/components/Charts/info-gerais/chart.tsx`
- Bar Chart: `src/app/fase-a/_components/energy-chart.tsx`
- Donut Chart: `src/components/Charts/used-devices/chart.tsx`

### Tipagem TypeScript
```tsx
import type { ApexOptions } from "apexcharts";

const options: ApexOptions = {
  // Autocomplete completo
};
```

---

## 🎓 Boas Práticas

### ✅ DO

- Sempre usar `dynamic import` com `ssr: false`
- Definir `height` explicitamente
- Usar `fontFamily: "inherit"` para consistência
- Desabilitar toolbar em produção: `toolbar: { show: false }`
- Usar breakpoints responsivos
- Formatar tooltips com unidades corretas
- Adaptar stroke width para mobile

### ❌ DON'T

- Não usar `import ReactApexChart from 'react-apexcharts'` diretamente
- Não esquecer `type` no `ApexOptions`
- Não usar cores hardcoded (usar variáveis)
- Não abusar de `dataLabels.enabled = true` (polui o gráfico)
- Não usar `stacked: true` sem necessidade
- Não esquecer `axisBorder.show = false` (consistência visual)

---

## 🔮 Futuras Melhorias

1. **Animações customizadas**
   ```tsx
   chart: {
     animations: {
       enabled: true,
       easing: 'easeinout',
       speed: 800,
     },
   }
   ```

2. **Anotações (metas/limites)**
   ```tsx
   annotations: {
     yaxis: [{
       y: 240, // Limite máximo de tensão
       borderColor: '#FF0000',
       label: { text: 'Limite Máximo' }
     }]
   }
   ```

3. **Exportação de dados**
   ```tsx
   chart: {
     toolbar: {
       show: true,
       export: {
         csv: { filename: 'dados-fase-a' },
         png: { filename: 'grafico-fase-a' },
       },
     },
   }
   ```

4. **Comparação com período anterior**
   ```tsx
   series: [
     { name: "Este mês", data: [...] },
     { name: "Mês passado", data: [...], type: "line", strokeDashArray: 5 },
   ]
   ```

---

## 📝 Exemplo Completo de Implementação

```tsx
"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  series: { name: string; data: { x: unknown; y: number }[] }[];
  title: string;
};

export function MyCustomChart({ series, title }: Props) {
  const isMobile = useIsMobile();
  
  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 310,
      fontFamily: "inherit",
      toolbar: { show: false },
      zoom: { 
        enabled: !isMobile, // Desktop: zoom habilitado, Mobile: desabilitado para scroll
        type: "x",
        autoScaleYaxis: true,
      },
      selection: {
        enabled: !isMobile, // Desktop: seleção habilitada, Mobile: desabilitada para scroll
      },
    },
    colors: ["#5750F1", "#0ABEF9"],
    stroke: {
      curve: "smooth",
      width: isMobile ? 2 : 3,
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    grid: {
      strokeDashArray: 5,
    },
    xaxis: {
      tickAmount: 12,
      axisBorder: { show: false },
    },
    legend: {
      show: true,
      position: "top",
    },
  };

  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="-ml-4 -mr-5">
        <Chart options={options} series={series} type="area" height={310} />
      </div>
    </div>
  );
}
```

---

**Última atualização:** Janeiro 2026  
**Versão ApexCharts:** 5.3.6  
**Versão React ApexCharts:** 1.7.0
