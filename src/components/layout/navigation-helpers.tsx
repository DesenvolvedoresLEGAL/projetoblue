
import { NavigationItemProps } from './sidebar/NavigationItem';
import { NavigationModuleProps } from './sidebar/NavigationModule';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Ticket, 
  Star, 
  Network, 
  Search,
  Settings,
  PlusCircle,
  PackageSearch,
  Link as LinkIcon,
  ActivitySquare,
  FileText,
  Scan,
  HelpCircle,
  Book,
  ClipboardList,
  Laptop
} from 'lucide-react';

export const getNavigationModules = (): Omit<NavigationModuleProps, 'isCollapsed' | 'isExpanded' | 'onToggle'>[] => [
  {
    title: 'Principal',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/dashboard'
      }
    ]
  },
  {
    title: 'Gestão de Ativos',
    requiredRole: 'suporte',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/assets/dashboard',
        requiredRole: 'suporte'
      },
      {
        icon: PackageSearch,
        label: 'Inventário',
        href: '/assets/inventory',
        requiredRole: 'suporte'
      },
      {
        icon: PlusCircle,
        label: 'Registrar Ativo',
        href: '/assets/register',
        requiredRole: 'suporte'
      },
      {
        icon: LinkIcon,
        label: 'Vincular Ativo',
        href: '/link-asset',
        requiredRole: 'suporte'
      },
      {
        icon: ActivitySquare,
        label: 'Status',
        href: '/assets/status',
        requiredRole: 'suporte'
      }
    ]
  },
  {
    title: 'Atendimento',
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/tickets/dashboard'
      },
      {
        icon: Ticket,
        label: 'Tickets',
        href: '/tickets/inbox'
      },
      {
        icon: Laptop,
        label: 'Acesso Remoto',
        href: '/support/remote-access'
      },
      {
        icon: Book,
        label: 'Playbooks',
        href: '/support/playbooks'
      },
      {
        icon: ClipboardList,
        label: 'Auditoria',
        href: '/support/audit'
      }
    ]
  },
  {
    title: 'Clientes',
    requiredRole: 'suporte',
    items: [
      {
        icon: Users,
        label: 'Gerenciar Clientes',
        href: '/clients',
        requiredRole: 'suporte'
      }
    ]
  },
  {
    title: 'BITS™',
    requiredRole: 'cliente',
    items: [
      {
        icon: Star,
        label: 'Programa BITS™',
        href: '/bits',
        requiredRole: 'cliente'
      }
    ]
  },
  {
    title: 'Rede',
    items: [
      {
        icon: Network,
        label: 'Topologia',
        href: '/topology/view'
      }
    ]
  },
  {
    title: 'Ferramentas',
    items: [
      {
        icon: Search,
        label: 'Descoberta',
        href: '/tools/discovery'
      },
      {
        icon: FileText,
        label: 'Exportar',
        href: '/tools/export'
      }
    ]
  },
  {
    title: 'Administração',
    requiredRole: 'gestor',
    items: [
      {
        icon: Settings,
        label: 'Fornecedores',
        href: '/suppliers',
        requiredRole: 'gestor'
      }
    ]
  }
];
