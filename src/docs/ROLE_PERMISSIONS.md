# Permissões por Role

Este documento descreve quais funcionalidades estão disponíveis para cada papel (role) na plataforma BLUE. As permissões são derivadas da hierarquia definida em `src/constants/auth.ts` e utilizadas no hook `usePermissions`.

## Hierarquia de Roles

A ordem de privilégio dos roles é a seguinte:

1. `admin`
2. `suporte`
3. `cliente`
4. `user`

Um role mais alto herda todas as permissões dos roles abaixo.

## Tabela de Permissões

| Permissão | Papel mínimo | user | cliente | suporte | admin |
|-------------|--------------|------|---------|---------|-------|
| Visualizar painel | user | ✔️ | ✔️ | ✔️ | ✔️ |
| Acessar Bits | cliente |  | ✔️ | ✔️ | ✔️ |
| Visualizar clientes | suporte |  |  | ✔️ | ✔️ |
| Criar clientes | suporte |  |  | ✔️ | ✔️ |
| Editar clientes | suporte |  |  | ✔️ | ✔️ |
| Excluir clientes | suporte |  |  | ✔️ | ✔️ |
| Visualizar ativos | suporte |  |  | ✔️ | ✔️ |
| Criar ativos | suporte |  |  | ✔️ | ✔️ |
| Editar ativos | suporte |  |  | ✔️ | ✔️ |
| Excluir ativos | suporte |  |  | ✔️ | ✔️ |
| Gerenciar associações | suporte |  |  | ✔️ | ✔️ |
| Visualizar relatórios | suporte |  |  | ✔️ | ✔️ |
| Exportar dados | suporte |  |  | ✔️ | ✔️ |
| Gerenciar usuários | admin |  |  |  | ✔️ |
| Acessar painel de administração | admin |  |  |  | ✔️ |
| Modificar configurações do sistema | admin |  |  |  | ✔️ |
| Prestar suporte | suporte |  |  | ✔️ | ✔️ |
| Acessar chamados | suporte |  |  | ✔️ | ✔️ |
| Gerenciar chamados | suporte |  |  | ✔️ | ✔️ |
| Gerar indicações | cliente |  | ✔️ | ✔️ | ✔️ |

**Observação:** estas permissões correspondem à implementação atual do arquivo [`usePermissions`](../hooks/usePermissions.ts). Altere este documento caso novas permissões sejam adicionadas ou se a hierarquia de roles mudar.
