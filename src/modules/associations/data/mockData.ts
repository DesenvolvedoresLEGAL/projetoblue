
import { Client, Manufacturer, AssetSolution, Asset, Association, AssociationWithRelations } from '../types/associationsTypes';

export const mockClients: Client[] = [
  {
    uuid: 'client-001',
    nome: 'João Silva Santos',
    empresa: 'Silva & Associados Ltda',
    responsavel: 'João Silva',
    contato: '11987654321',
    email: 'joao@silvaassociados.com.br',
    cnpj: '12.345.678/0001-90',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    uuid: 'client-002',
    nome: 'Maria Oliveira Costa',
    empresa: 'TechSoluções Brasil',
    responsavel: 'Maria Costa',
    contato: '11987654322',
    email: 'maria@techsolucoes.com.br',
    cnpj: '23.456.789/0001-01',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z'
  },
  {
    uuid: 'client-003',
    nome: 'Carlos Eduardo Ferreira',
    empresa: 'Ferreira Construções',
    responsavel: 'Carlos Ferreira',
    contato: '11987654323',
    email: 'carlos@ferreiraconstrucoes.com.br',
    cnpj: '34.567.890/0001-12',
    created_at: '2024-01-17T12:00:00Z',
    updated_at: '2024-01-17T12:00:00Z'
  },
  {
    uuid: 'client-004',
    nome: 'Ana Paula Rodrigues',
    empresa: 'Rodrigues Consultoria',
    responsavel: 'Ana Rodrigues',
    contato: '11987654324',
    email: 'ana@rodriguesconsultoria.com.br',
    cnpj: '45.678.901/0001-23',
    created_at: '2024-01-18T13:00:00Z',
    updated_at: '2024-01-18T13:00:00Z'
  },
  {
    uuid: 'client-005',
    nome: 'Roberto Lima Sousa',
    empresa: 'Lima Digital Solutions',
    responsavel: 'Roberto Lima',
    contato: '11987654325',
    email: 'roberto@limadigital.com.br',
    cnpj: '56.789.012/0001-34',
    created_at: '2024-01-19T14:00:00Z',
    updated_at: '2024-01-19T14:00:00Z'
  },
  {
    uuid: 'client-006',
    nome: 'Fernanda Alves Pereira',
    empresa: 'Alves & Pereira Advocacia',
    responsavel: 'Fernanda Alves',
    contato: '11987654326',
    email: 'fernanda@alves-pereira.com.br',
    cnpj: '67.890.123/0001-45',
    created_at: '2024-01-20T15:00:00Z',
    updated_at: '2024-01-20T15:00:00Z'
  },
  {
    uuid: 'client-007',
    nome: 'Paulo Henrique Martins',
    empresa: 'Martins Engenharia',
    responsavel: 'Paulo Martins',
    contato: '11987654327',
    email: 'paulo@martinsengenharia.com.br',
    cnpj: '78.901.234/0001-56',
    created_at: '2024-01-21T16:00:00Z',
    updated_at: '2024-01-21T16:00:00Z'
  },
  {
    uuid: 'client-008',
    nome: 'Juliana Santos Barbosa',
    empresa: 'Barbosa Contabilidade',
    responsavel: 'Juliana Barbosa',
    contato: '11987654328',
    email: 'juliana@barbosacontabil.com.br',
    cnpj: '89.012.345/0001-67',
    created_at: '2024-01-22T17:00:00Z',
    updated_at: '2024-01-22T17:00:00Z'
  },
  {
    uuid: 'client-009',
    nome: 'Ricardo Gomes Silva',
    empresa: 'Gomes Transportes',
    responsavel: 'Ricardo Gomes',
    contato: '11987654329',
    email: 'ricardo@gomestransportes.com.br',
    cnpj: '90.123.456/0001-78',
    created_at: '2024-01-23T18:00:00Z',
    updated_at: '2024-01-23T18:00:00Z'
  },
  {
    uuid: 'client-010',
    nome: 'Luciana Costa Araujo',
    empresa: 'Araujo Marketing Digital',
    responsavel: 'Luciana Araujo',
    contato: '11987654330',
    email: 'luciana@araujomarketing.com.br',
    cnpj: '01.234.567/0001-89',
    created_at: '2024-01-24T19:00:00Z',
    updated_at: '2024-01-24T19:00:00Z'
  },
  {
    uuid: 'client-011',
    nome: 'Marcos Antonio Lopes',
    empresa: 'Lopes Segurança Eletrônica',
    responsavel: 'Marcos Lopes',
    contato: '11987654331',
    email: 'marcos@lopesseguranca.com.br',
    cnpj: '12.345.678/0001-91',
    created_at: '2024-01-25T20:00:00Z',
    updated_at: '2024-01-25T20:00:00Z'
  },
  {
    uuid: 'client-012',
    nome: 'Cristina Mendes Rocha',
    empresa: 'Rocha Arquitetura',
    responsavel: 'Cristina Rocha',
    contato: '11987654332',
    email: 'cristina@rochaarquitetura.com.br',
    cnpj: '23.456.789/0001-02',
    created_at: '2024-01-26T21:00:00Z',
    updated_at: '2024-01-26T21:00:00Z'
  },
  {
    uuid: 'client-013',
    nome: 'André Luiz Nascimento',
    empresa: 'Nascimento Logística',
    responsavel: 'André Nascimento',
    contato: '11987654333',
    email: 'andre@nascimentologistica.com.br',
    cnpj: '34.567.890/0001-13',
    created_at: '2024-01-27T22:00:00Z',
    updated_at: '2024-01-27T22:00:00Z'
  },
  {
    uuid: 'client-014',
    nome: 'Patrícia Ramos Cunha',
    empresa: 'Cunha Recursos Humanos',
    responsavel: 'Patrícia Cunha',
    contato: '11987654334',
    email: 'patricia@cunharh.com.br',
    cnpj: '45.678.901/0001-24',
    created_at: '2024-01-28T23:00:00Z',
    updated_at: '2024-01-28T23:00:00Z'
  },
  {
    uuid: 'client-015',
    nome: 'Rafael Torres Vieira',
    empresa: 'Vieira Tecnologia',
    responsavel: 'Rafael Vieira',
    contato: '11987654335',
    email: 'rafael@vieiratecnologia.com.br',
    cnpj: '56.789.012/0001-35',
    created_at: '2024-01-29T08:00:00Z',
    updated_at: '2024-01-29T08:00:00Z'
  }
];

export const mockManufacturers: Manufacturer[] = [
  {
    id: 1,
    name: 'Claro',
    country: 'Brasil',
    description: 'Operadora de telecomunicações',
    notes: 'OPERADORA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Vivo',
    country: 'Brasil',
    description: 'Operadora de telecomunicações',
    notes: 'OPERADORA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'TIM',
    country: 'Brasil',
    description: 'Operadora de telecomunicações',
    notes: 'OPERADORA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Huawei',
    country: 'China',
    description: 'Fabricante de equipamentos de telecomunicações',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Intelbras',
    country: 'Brasil',
    description: 'Fabricante de equipamentos de telecomunicações',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockAssetSolutions: AssetSolution[] = [
  {
    id: 1,
    solution: 'SPEEDY 5G',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    solution: '4BLACK',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    solution: '4PLUS',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 11,
    solution: 'CHIP',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockAssets: Asset[] = [
  // Equipamentos
  {
    uuid: 'asset-001',
    model: 'RG500Q-EA',
    serial_number: 'HW001234',
    radio: 'AC1200',
    solution_id: 1,
    manufacturer_id: 4,
    rented_days: 45,
    admin_user: 'admin',
    admin_pass: 'admin123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    uuid: 'asset-002',
    model: 'RG502Q-EA',
    serial_number: 'HW001235',
    radio: 'AC1900',
    solution_id: 2,
    manufacturer_id: 4,
    rented_days: 30,
    admin_user: 'admin',
    admin_pass: 'admin123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Chips
  {
    uuid: 'asset-chip-001',
    iccid: '89550534000000123456',
    line_number: 11987654321,
    solution_id: 11,
    manufacturer_id: 1,
    rented_days: 60,
    admin_user: 'admin',
    admin_pass: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    uuid: 'asset-chip-002',
    iccid: '89550534000000123457',
    line_number: 11987654322,
    solution_id: 11,
    manufacturer_id: 2,
    rented_days: 90,
    admin_user: 'admin',
    admin_pass: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockAssociations: Association[] = [
  // Associações ativas
  {
    uuid: 'assoc-001',
    client_id: 'client-001',
    equipment_id: 'asset-001',
    chip_id: 'asset-chip-001',
    entry_date: '2024-01-15',
    association_type_id: 1,
    plan_id: 1,
    plan_gb: 50,
    equipment_ssid: 'BlueWiFi_001',
    equipment_pass: 'password123',
    status: true,
    notes: 'Primeira associação do cliente',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    uuid: 'assoc-002',
    client_id: 'client-002',
    equipment_id: 'asset-002',
    chip_id: 'asset-chip-002',
    entry_date: '2024-01-16',
    association_type_id: 2,
    plan_id: 2,
    plan_gb: 100,
    equipment_ssid: 'BlueWiFi_002',
    equipment_pass: 'password456',
    status: true,
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z'
  },
  // Mais associações serão geradas dinamicamente
];

// Função para gerar mais associações dinamicamente
export const generateMockAssociations = (): AssociationWithRelations[] => {
  const associations: AssociationWithRelations[] = [];
  
  // Criar múltiplas associações para cada cliente
  mockClients.forEach((client, clientIndex) => {
    const numAssociations = Math.floor(Math.random() * 5) + 1; // 1-5 associações por cliente
    
    for (let i = 0; i < numAssociations; i++) {
      const isActive = Math.random() > 0.4; // 60% ativas
      const equipment = mockAssets.find(a => a.solution_id !== 11);
      const chip = mockAssets.find(a => a.solution_id === 11);
      
      const association: AssociationWithRelations = {
        uuid: `assoc-${clientIndex}-${i}`,
        client_id: client.uuid,
        equipment_id: equipment?.uuid,
        chip_id: chip?.uuid,
        entry_date: `2024-0${Math.floor(Math.random() * 2) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        exit_date: isActive ? undefined : `2024-0${Math.floor(Math.random() * 2) + 2}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        association_type_id: Math.floor(Math.random() * 2) + 1,
        plan_id: Math.floor(Math.random() * 3) + 1,
        plan_gb: [10, 25, 50, 100][Math.floor(Math.random() * 4)],
        equipment_ssid: `BlueWiFi_${clientIndex}_${i}`,
        equipment_pass: `pass${Math.random().toString(36).substr(2, 8)}`,
        status: isActive,
        notes: i === 0 ? 'Primeira associação do cliente' : `Associação ${i + 1}`,
        created_at: `2024-01-${String(15 + clientIndex).padStart(2, '0')}T${String(10 + i).padStart(2, '0')}:00:00Z`,
        updated_at: `2024-01-${String(15 + clientIndex).padStart(2, '0')}T${String(10 + i).padStart(2, '0')}:00:00Z`,
        client,
        equipment: equipment ? {
          ...equipment,
          manufacturer: mockManufacturers.find(m => m.id === equipment.manufacturer_id),
          solution: mockAssetSolutions.find(s => s.id === equipment.solution_id)
        } : undefined,
        chip: chip ? {
          ...chip,
          manufacturer: mockManufacturers.find(m => m.id === chip.manufacturer_id),
          solution: mockAssetSolutions.find(s => s.id === chip.solution_id)
        } : undefined
      };
      
      associations.push(association);
    }
  });
  
  return associations;
};
