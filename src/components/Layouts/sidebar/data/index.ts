import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "",
    items: [
      {
        title: "Visão geral",
        url: "/",
        icon: Icons.HomeIcon,
        description: "Resumo geral do sistema.",
        items: [],
      },
      {
        title: "Trifásico",
        url: "/trifasico",
        icon: Icons.Alphabet,
        description: "Visão consolidada das três fases.",
        items: [
          {
            title: "Fase A",
            url: "/fase-a",
            description: "Detalhes e indicadores da fase A.",
          },
          {
            title: "Fase B",
            url: "/fase-b",
            description: "Detalhes e indicadores da fase B.",
          },
          {
            title: "Fase C",
            url: "/fase-c",
            description: "Detalhes e indicadores da fase C.",
          },
        ],
      },
      {
        title: "Alarmes",
        url: "/alarms",
        icon: Icons.Table,
        description: "Lista e status dos alarmes.",
        items: [],
      },
      {
        title: "Histórico",
        url: "/historico",
        icon: Icons.Table,
        description: "Registros e eventos anteriores.",
        items: [],
      },
      {
        title: "Gráficos",
        url: "/graficos",
        icon: Icons.PieChart,
        description: "Tendências e comparativos em gráficos.",
        items: [],
      },
      {
        title: "Informações adicionais",
        url: "/informacoes-adicionais",
        icon: Icons.FourCircle,
        description: "Dados complementares do sistema.",
        items: [],
      },
    ],
  },
];
