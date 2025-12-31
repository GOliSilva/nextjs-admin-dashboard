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
        url: "/graficos",
        icon: Icons.PieChart,
        description: "Tend\u00eancias e comparativos em gr\u00e1ficos.",
        items: [],
      },
      {
        title: "Trif\u00e1sico",
        url: "/trifasico",
        icon: Icons.Alphabet,
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
        icon: Icons.Table,
        description: "Lista e status dos alarmes.",
        items: [],
      },
      {
        title: "Hist\u00f3rico",
        url: "/historico",
        icon: Icons.Table,
        description: "Registros e eventos anteriores.",
        items: [],
      },
      {
        title: "Consumo",
        url: "/",
        icon: Icons.HomeIcon,
        description: "Resumo geral do sistema.",
        items: [],
      },
      {
        title: "Informa\u00e7\u00f5es adicionais",
        url: "/informacoes-adicionais",
        icon: Icons.FourCircle,
        description: "Dados complementares do sistema.",
        items: [],
      },
    ],
  },
];
