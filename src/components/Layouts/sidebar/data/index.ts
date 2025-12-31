import * as Icons from "../icons";

type IconType = (props: Icons.PropsType) => JSX.Element;

type NavSubItem = {
  title: string;
  url: string;
  description?: string;
};

type NavItem = {
  title: string;
  url?: string;
  icon: IconType;
  description?: string;
  items: NavSubItem[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_DATA: NavSection[] = [
  {
    label: "",
    items: [
      {
        title: "Vis\u00e3o geral",
        url: "/geral",
        icon: Icons.HomeIcon,
        description: "Gr\u00e1ficos e tend\u00eancias do sistema.",
        items: [],
      },
      {
        title: "Gr\u00e1ficos",
        url: "/graficos",
        icon: Icons.ChartLine,
        description: "An\u00e1lise visual detalhada.",
        items: [],
      },
      {
        title: "Trif\u00e1sico",
        icon: Icons.Layers,
        description: "Vis\u00e3o consolidada das tr\u00eas fases.",
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
        icon: Icons.Bell,
        description: "Lista e status dos alarmes.",
        items: [],
      },
      {
        title: "Hist\u00f3rico",
        url: "/historico",
        icon: Icons.Clock,
        description: "Registros e eventos anteriores.",
        items: [],
      },
      {
        title: "Consumo",
        url: "/",
        icon: Icons.Gauge,
        description: "Indicadores de consumo e uso de energia.",
        items: [],
      },
      {
        title: "Informa\u00e7\u00f5es adicionais",
        url: "/informacoes-adicionais",
        icon: Icons.InfoCircle,
        description: "Dados complementares do sistema.",
        items: [],
      },
    ],
  },
];
