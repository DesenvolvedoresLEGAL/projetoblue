import { User, BarChart3, Package, Settings, Users, Calendar, FileText, History, Wifi, Network, Share2, TrendingUp, MapPin, Zap, HelpCircle, Gift, Target, UserCheck, Settings2, Monitor, Database } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: NavLink[];
    }
);

export type NavLink = {
  title: string;
  href: string;
  disabled?: boolean;
  icon?: keyof typeof Icons;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
};

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};

export type MarketingConfig = {
  mainNav: MainNavItem[];
};

export const Icons = {
  close: "close",
  copy: "copy",
  darkMode: "darkMode",
  github: "github",
  lightMode: "lightMode",
  menu: "menu",
  message: "message",
  og: "og",
  twitter: "twitter",
  external: "external",
  spinner: "spinner",
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  question: "question",
  check: "check",
  chevronLeft: "chevronLeft",
  chevronRight: "chevronRight",
  trash: "trash",
  pencil: "pencil",
  plus: "plus",
  search: "search",
  download: "download",
  upload: "upload",
  filter: "filter",
  sort: "sort",
  chevronDown: "chevronDown",
  chevronUp: "chevronUp",
  moreHorizontal: "moreHorizontal",
  eye: "eye",
  xCircle: "xCircle",
  arrowLeft: "arrowLeft",
  arrowRight: "arrowRight",
  arrowUp: "arrowUp",
  arrowDown: "arrowDown",
  alertCircle: "alertCircle",
  alertTriangle: "alertTriangle",
  checkCircle: "checkCircle",
  infoCircle: "infoCircle",
  helpCircle: "helpCircle",
  exclamationCircle: "exclamationCircle",
  exclamationTriangle: "exclamationTriangle",
  questionCircle: "questionCircle",
  shieldCheck: "shieldCheck",
  lock: "lock",
  unlock: "unlock",
  user: "user",
  users: "users",
  home: "home",
  settings: "settings",
  bell: "bell",
  mail: "mail",
  calendar: "calendar",
  fileText: "fileText",
  barChart3: "barChart3",
  package: "package",
  wifi: "wifi",
  network: "network",
  share2: "share2",
  trendingUp: "trendingUp",
  mapPin: "mapPin",
  zap: "zap",
  gift: "gift",
  target: "target",
  userCheck: "userCheck",
  settings2: "settings2",
  monitor: "monitor",
  database: "database",
  history: "history",
} as const;

export const navigationModules = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: BarChart3,
    description: "Visão geral do sistema",
    type: "single" as const,
    path: "/dashboard",
    badge: null,
    isExpanded: false,
    children: []
  },
  {
    id: "assets",
    title: "Gestão de Ativos",
    icon: Package,
    description: "Gerenciamento completo de ativos",
    type: "module" as const,
    path: "/assets",
    badge: null,
    isExpanded: false,
    children: [
      {
        id: "assets-summary",
        title: "Visão Geral",
        path: "/assets",
        icon: BarChart3,
        description: "Dashboard de ativos"
      },
      {
        id: "assets-inventory",
        title: "Inventário",
        path: "/assets/inventory",
        icon: Database,
        description: "Lista completa de ativos"
      },
      {
        id: "assets-association",
        title: "Nova Associação",
        path: "/assets/association",
        icon: UserCheck,
        description: "Associar ativos a clientes"
      },
      {
        id: "assets-associations",
        title: "Gestão de Associações",
        path: "/assets/associations",
        icon: Share2,
        description: "Gerenciar associações existentes"
      }
    ]
  },
  {
    id: "clients",
    title: "Clientes",
    icon: Users,
    description: "Gerenciamento de clientes",
    type: "single" as const,
    path: "/clients",
    badge: null,
    isExpanded: false,
    children: []
  },
  {
    id: "schedules",
    title: "Agendamentos",
    icon: Calendar,
    description: "Gerenciamento de agendamentos",
    type: "single" as const,
    path: "/schedules",
    badge: null,
    isExpanded: false,
    children: []
  },
  {
    id: "reports",
    title: "Relatórios",
    icon: FileText,
    description: "Relatórios e estatísticas",
    type: "single" as const,
    path: "/reports",
    badge: null,
    isExpanded: false,
    children: []
  },
  {
    id: "history",
    title: "Histórico",
    icon: History,
    description: "Histórico de alterações",
    type: "single" as const,
    path: "/history",
    badge: null,
    isExpanded: false,
    children: []
  },
  {
    id: "network",
    title: "Rede",
    icon: Network,
    description: "Monitoramento de rede",
    type: "module" as const,
    path: "/network",
    badge: null,
    isExpanded: false,
    children: [
      {
        id: "network-map",
        title: "Mapa de Rede",
        path: "/network/map",
        icon: MapPin,
        description: "Mapa de rede"
      },
      {
        id: "network-devices",
        title: "Dispositivos",
        path: "/network/devices",
        icon: Wifi,
        description: "Dispositivos na rede"
      },
      {
        id: "network-status",
        title: "Status da Rede",
        path: "/network/status",
        icon: Zap,
        description: "Status da rede"
      }
    ]
  },
  {
    id: "marketing",
    title: "Marketing",
    icon: TrendingUp,
    description: "Ferramentas de marketing",
    type: "module" as const,
    path: "/marketing",
    badge: null,
    isExpanded: false,
    children: [
      {
        id: "marketing-campaigns",
        title: "Campanhas",
        path: "/marketing/campaigns",
        icon: Gift,
        description: "Campanhas de marketing"
      },
      {
        id: "marketing-analytics",
        title: "Analytics",
        path: "/marketing/analytics",
        icon: Target,
        description: "Analytics de marketing"
      }
    ]
  },
  {
    id: "settings",
    title: "Configurações",
    icon: Settings,
    description: "Configurações do sistema",
    type: "single" as const,
    path: "/settings",
    badge: null,
    isExpanded: false,
    children: []
  },
  {
    id: "admin",
    title: "Admin",
    icon: Settings2,
    description: "Administração do sistema",
    type: "module" as const,
    path: "/admin",
    badge: null,
    isExpanded: false,
    children: [
      {
        id: "admin-users",
        title: "Usuários",
        path: "/admin/users",
        icon: User,
        description: "Gerenciar usuários"
      },
      {
        id: "admin-roles",
        title: "Funções",
        path: "/admin/roles",
        icon: Users,
        description: "Gerenciar funções"
      },
      {
        id: "admin-settings",
        title: "Configurações",
        path: "/admin/settings",
        icon: Settings,
        description: "Configurações do sistema"
      }
    ]
  },
  {
    id: "help",
    title: "Ajuda",
    icon: HelpCircle,
    description: "Central de ajuda",
    type: "single" as const,
    path: "/help",
    badge: null,
    isExpanded: false,
    children: []
  }
];

export const generateBreadcrumbsFromPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  // Mapeamento de rotas para labels legíveis
  const routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'assets': 'Gestão de Ativos',
    'inventory': 'Inventário',
    'association': 'Nova Associação',
    'associations': 'Gestão de Associações',
    'clients': 'Clientes',
    'register-asset': 'Cadastrar Ativo',
    'export': 'Relatórios',
    'settings': 'Configurações',
    'history': 'Histórico'
  };

  let currentPath = '';
  
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      label,
      path: currentPath
    });
  }

  return breadcrumbs;
};
