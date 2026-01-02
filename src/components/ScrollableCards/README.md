# 📦 ScrollableCards Component

## 📝 Descrição

Componente modular e reutilizável para exibir cards com scroll horizontal em mobile e grid em desktop.

## 🎯 Características

- ✅ Scroll horizontal em mobile
- ✅ Grid responsivo em tablet/desktop
- ✅ Altura igual para todos os cards
- ✅ Indicadores de crescimento/decrescimento
- ✅ Ícones SVG customizáveis
- ✅ Estilos customizáveis por card
- ✅ Modo compacto ou padrão

## 📦 Importação

```tsx
import { ScrollableCards, type CardData } from "@/components/ScrollableCards";
```

## 🔧 Props

### ScrollableCards

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `cards` | `CardData[]` | **required** | Array de dados dos cards |
| `compact` | `boolean` | `true` | Modo compacto (menor padding/fontes) |
| `cardWidth` | `string` | `"140px"` | Largura dos cards em mobile |
| `className` | `string` | `undefined` | Classes CSS adicionais |

### CardData

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `label` | `string` | ✅ | Rótulo/título do card |
| `value` | `string \| number` | ✅ | Valor principal a exibir |
| `Icon` | `SVGComponent` | ✅ | Componente de ícone SVG |
| `growthRate` | `number` | ❌ | Taxa de crescimento (padrão: 0) |
| `indicatorValue` | `string` | ❌ | Texto customizado do indicador |
| `indicatorIsDecreasing` | `boolean` | ❌ | Se está diminuindo (padrão: baseado em growthRate) |
| `hideIndicator` | `boolean` | ❌ | Esconder indicador |
| `valueStyle` | `CSSProperties` | ❌ | Estilos inline para o valor |
| `indicatorStyle` | `CSSProperties` | ❌ | Estilos inline para o indicador |
| `iconProps` | `SVGProps` | ❌ | Props para o componente de ícone |

## 📖 Exemplos de Uso

### Exemplo Básico

```tsx
import { ScrollableCards, type CardData } from "@/components/ScrollableCards";

// Seus ícones SVG
import { TensaoIcon, CorrenteIcon, PotenciaIcon } from "./icons";

function MyDashboard() {
  const cards: CardData[] = [
    {
      label: "Tensão",
      value: "220.00 V",
      indicatorValue: "100%",
      Icon: TensaoIcon,
    },
    {
      label: "Corrente",
      value: "45.2 A",
      growthRate: 5.2,
      Icon: CorrenteIcon,
    },
    {
      label: "Potência",
      value: "9.944 kW",
      hideIndicator: true,
      Icon: PotenciaIcon,
    },
  ];

  return <ScrollableCards cards={cards} />;
}
```

### Exemplo com Dados Dinâmicos

```tsx
async function EnergyDashboard() {
  // Buscar dados de uma API
  const data = await fetchEnergyData();

  const cards: CardData[] = [
    {
      label: "Tensão Fase A",
      value: `${data.voltageA.toFixed(2)} V`,
      indicatorValue: `${((data.voltageA / 220) * 100).toFixed(1)}%`,
      indicatorIsDecreasing: data.voltageA < 220,
      indicatorStyle: { color: getColorForVoltage(data.voltageA) },
      Icon: VoltageAIcon,
    },
    {
      label: "Tensão Fase B",
      value: `${data.voltageB.toFixed(2)} V`,
      indicatorValue: `${((data.voltageB / 220) * 100).toFixed(1)}%`,
      indicatorIsDecreasing: data.voltageB < 220,
      Icon: VoltageBIcon,
    },
    {
      label: "Corrente Total",
      value: `${data.current} A`,
      growthRate: data.currentGrowth,
      Icon: CurrentIcon,
    },
  ];

  return <ScrollableCards cards={cards} compact />;
}
```

### Exemplo com Estilos Customizados

```tsx
const cards: CardData[] = [
  {
    label: "Temperatura",
    value: "75°C",
    growthRate: 10,
    valueStyle: { color: "#ff4444", fontSize: "1.5rem" },
    indicatorStyle: { color: "#ff4444" },
    Icon: TemperatureIcon,
    iconProps: { className: "size-12 text-red-500" },
  },
  {
    label: "Umidade",
    value: "60%",
    growthRate: -5,
    Icon: HumidityIcon,
  },
];

return <ScrollableCards cards={cards} compact={false} cardWidth="180px" />;
```

### Exemplo Modo Desktop (Grid)

```tsx
// Desabilitar modo compacto para grid sempre
const cards: CardData[] = [
  // ... seus cards
];

return <ScrollableCards cards={cards} compact={false} />;
```

### Exemplo com Classe Customizada

```tsx
return (
  <ScrollableCards 
    cards={cards} 
    compact 
    className="my-custom-container"
  />
);
```

## 🎨 Comportamento Responsivo

### Mobile (< 640px)
- Scroll horizontal
- Cards com largura fixa (`cardWidth`)
- Padding nas bordas (`-mx-4 px-4`)

### Tablet (640px - 1280px)
- Grid 2 colunas
- Cards ocupam largura total

### Desktop (> 1280px)
- Grid 4 colunas
- Cards ocupam largura total
- Gap aumentado

## 🎯 Indicadores

### Crescimento (Verde ↑)
- Quando `growthRate > 0` ou `indicatorIsDecreasing === false`
- Cor: `text-green`

### Decrescimento (Vermelho ↓)
- Quando `growthRate < 0` ou `indicatorIsDecreasing === true`
- Cor: `text-red`

### Sem Indicador
- Quando `hideIndicator === true`

## 📐 Dimensões

### Modo Compacto (`compact={true}`)
- Padding: `p-3`
- Ícone: `size-8` (mobile) → `size-[58px]` (desktop)
- Valor: `text-base`
- Label: `text-[11px]`
- Indicador: `text-[11px]`

### Modo Padrão (`compact={false}`)
- Padding: `p-6`
- Ícone: tamanho padrão
- Valor: `text-heading-6`
- Label: `text-sm`
- Indicador: `text-sm`

## 🔍 Casos de Uso

1. **Dashboard de Energia** - Tensões, correntes, potências
2. **Métricas de Performance** - CPU, RAM, Disco
3. **KPIs de Negócio** - Vendas, conversões, receita
4. **Status de Sistemas** - Uptime, latência, erros
5. **Dados Meteorológicos** - Temperatura, umidade, pressão
6. **Analytics** - Usuários, sessões, pageviews

## 🚀 Vantagens

- ✅ **Reutilizável** - Use em qualquer página
- ✅ **Responsivo** - Adapta-se a qualquer tela
- ✅ **Customizável** - Estilos e ícones personalizados
- ✅ **Type-safe** - TypeScript completo
- ✅ **Performático** - Otimizado para mobile e desktop
- ✅ **Acessível** - Semântica HTML apropriada

## 📝 Notas

- Os ícones de seta (↑↓) são incluídos no componente
- Pode substituir os ícones importando do seu `@/assets/icons`
- Cards sempre têm altura igual
- `whitespace-nowrap` evita quebra de linha no valor e label

---

**Última Atualização:** 2 de Janeiro de 2026
