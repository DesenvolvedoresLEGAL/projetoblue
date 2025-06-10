
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
  Settings
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
        icon: Package,
        label: 'Gestão de Ativos',
        href: '/assets',
        requiredRole: 'suporte'
      }
    ]
  },
  {
    title: 'Atendimento',
    items: [
      {
        icon: Ticket,
        label: 'Tickets',
        href: '/tickets/dashboard'
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
