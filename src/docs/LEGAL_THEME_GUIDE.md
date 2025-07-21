
# LEGAL Theme - Guia Completo

## Visão Geral

O tema LEGAL é um sistema de design moderno e acessível que utiliza as cores primárias da marca LEGAL para criar uma experiência visual consistente e profissional.

## Cores Principais

### Paleta de Cores LEGAL
- **Primary**: `#4D2BFB` (Azul principal)
- **Secondary**: `#03F9FF` (Ciano secundário)  
- **Dark**: `#020CBC` (Azul escuro)

### Variantes Automáticas
Cada cor possui variantes automáticas para hover e estados ativos:
- **Light**: Versão mais clara para hover
- **Default**: Cor base
- **Dark**: Versão mais escura para estados ativos

## Modo Escuro

O tema inclui suporte completo ao modo escuro com:
- Backgrounds específicos para diferentes níveis de hierarquia
- Cores de texto otimizadas para contraste
- Sombras adaptadas para o modo escuro
- Transições suaves entre modos

## Componentes Tematizados

### Botões
```typescript
// Primário
<Button variant="default">Ação Principal</Button>

// Secundário  
<Button variant="secondary">Ação Secundária</Button>

// Outline
<Button variant="outline">Ação Alternativa</Button>
```

### Cards
```typescript
<Card className="legal-card">
  <CardContent>Conteúdo do card</CardContent>
</Card>
```

### Inputs
```typescript
<Input className="legal-input" />
```

## Acessibilidade

### Contraste
- Todas as combinações de cores atendem ao padrão WCAG AA
- Suporte para modo de alto contraste
- Foco visível em todos os elementos interativos

### Movimento Reduzido
- Detecção automática de `prefers-reduced-motion`
- Animações reduzidas ou desabilitadas conforme necessário
- Efeitos de ripple opcionais

### Navegação por Teclado
- Indicadores de foco claros e consistentes
- Ordem de tabulação lógica
- Suporte para leitores de tela

## Configuração Avançada

### LegalThemeProvider
```typescript
import { LegalThemeProvider } from '@/components/ui/legal-theme-provider';

function App() {
  return (
    <LegalThemeProvider>
      <YourApp />
    </LegalThemeProvider>
  );
}
```

### Configurações Personalizadas
```typescript
const { config, updateConfig } = useLegalTheme();

// Desabilitar animações
updateConfig({ enableAnimations: false });

// Ativar modo de alto contraste
updateConfig({ contrastMode: 'high' });
```

## Utilitários

### Cores Programáticas
```typescript
import { getLegalColor } from '@/utils/theme-utils';

const primaryColor = getLegalColor('primary'); // #4D2BFB
const primaryLight = getLegalColor('primary', 'light'); // #6B46FC
const primaryWithOpacity = getLegalColor('primary', 'default', 0.5);
```

### Validação de Contraste
```typescript
import { isAccessibleColor } from '@/utils/theme-utils';

const isAccessible = isAccessibleColor('#4D2BFB', '#FFFFFF', 'AA');
```

## Classes CSS Utilitárias

### Cores
- `text-legal-primary` - Texto na cor primária
- `bg-legal-primary` - Background na cor primária
- `border-legal-primary` - Borda na cor primária

### Efeitos
- `legal-focus` - Foco padrão do tema
- `legal-hover-enhanced` - Hover com elevação
- `shadow-legal` - Sombra padrão do tema

### Responsividade
- `legal-responsive-text` - Texto que se adapta ao container

## Modo de Desenvolvimento

### Validação Automática
O tema inclui validadores automáticos que verificam:
- Variáveis CSS definidas corretamente
- Contraste adequado entre elementos
- Elementos com labels de acessibilidade

### Logs de Debug
```javascript
// Verificar estado do tema


// Validar variáveis CSS


// Verificar acessibilidade

```

## Performance

### Otimizações
- GPU acceleration para animações suaves
- Will-change otimizado para elementos animados
- Transições com cubic-bezier otimizado
- Container queries para responsividade

### Lazy Loading
Componentes de tema são carregados sob demanda para melhor performance inicial.

## Migração

### De Outros Temas
1. Substituir classes de cores por equivalentes LEGAL
2. Atualizar imports para usar novos componentes
3. Testar acessibilidade com ferramentas automáticas
4. Validar contraste em modo claro e escuro

### Versionamento
O tema segue semantic versioning:
- **Major**: Mudanças que quebram compatibilidade
- **Minor**: Novas funcionalidades
- **Patch**: Correções e melhorias

## Suporte

Para dúvidas ou problemas:
1. Verificar este guia primeiro
2. Consultar logs de validação no console
3. Usar componentes ThemeValidator para debug
4. Reportar issues com exemplos reproduzíveis
