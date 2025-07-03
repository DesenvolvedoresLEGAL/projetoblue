# Fluxo de Autenticação e Autorização

Este documento descreve como a plataforma BLUE lida com autenticação de usuários e controle de acesso por papel (role).

## Visão Geral

O aplicativo utiliza o [Supabase](https://supabase.com/) como provedor de autenticação. As informações de sessão e perfil ficam disponíveis por meio do `AuthContext`, exposto pelo componente `AuthProvider`.

Os papéis suportados são:

- `admin`
- `suporte`
- `cliente`
- `user`

A hierarquia de permissões está definida em `src/constants/auth.ts` e é utilizada pelas funções de verificação de papéis presentes em `src/utils/roleUtils.ts`.

## Autenticação

### Cadastro (signUp)
1. O componente [`Signup`](../pages/Signup.tsx) aciona `signUp` obtido pelo `useAuth`.
2. A função `signUp` utiliza `authService.signUp` (`src/services/authService.ts`) para registrar o usuário no Supabase.
3. Após a criação, o perfil é verificado e, se necessário, criado manualmente.
4. Em caso de sucesso, o usuário é redirecionado para `/login`.

### Login (signIn)
1. O componente [`Login`](../pages/Login.tsx) chama `signIn` via `useAuth`.
2. `signIn` autentica o usuário pelo Supabase e recupera o perfil via `profileService`.
3. São feitas validações extras (conta ativa, aprovada e não removida).
4. O contexto é atualizado e o usuário é redirecionado para a página solicitada ou `/`.

### Logout (signOut)
1. O método `signOut` do `useAuth` finaliza a sessão no Supabase.
2. O estado de usuário e perfil é limpo e o usuário volta para `/login`.

### Gerenciamento de Sessão
O hook [`useAuthSession`](../hooks/useAuthSession.tsx) configura um listener para mudanças de sessão do Supabase. Ele também realiza verificações periódicas e mostra um diálogo para renovação de sessão antes do logout automático.

## Autorização

O controle de acesso é realizado de duas formas principais:

- **Rotas protegidas** – O componente [`AuthRoute`](../components/auth/AuthRoute.tsx) garante que o usuário esteja autenticado e, opcionalmente, possua o papel mínimo exigido. Caso contrário, redireciona para `/login` ou `/unauthorized`.
- **Permissões de interface** – Hooks como [`usePermissions`](../hooks/usePermissions.ts) expõem permissões derivadas do papel do usuário. Esses valores são usados por componentes como [`RoleGuard`](../components/auth/RoleGuard.tsx) e [`PermissionButton`](../components/auth/PermissionButton.tsx) para condicionar a exibição de elementos da interface.

O cálculo de permissões utiliza a função `hasMinimumRole` definida em `src/utils/roleUtils.ts`, baseada na hierarquia presente em `src/constants/auth.ts`.

## Resumo

- A autenticação é feita pelo Supabase e integrada à aplicação por meio do `AuthProvider`.
- A autorização é baseada em papéis e validada pelo `AuthRoute`, `RoleGuard` e hooks de permissões.
- Perfis de usuário são carregados e verificados após o login para aplicar regras como contas inativas ou não aprovadas.

Consulte os arquivos mencionados para detalhes adicionais sobre cada etapa.
