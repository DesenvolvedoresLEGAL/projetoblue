
# BLUE Platform

## Temporary Supabase Direct Access Solution

### Background
Due to the unavailability of the BLUE API (`api.blue.legal`), we've implemented a temporary solution that uses Supabase directly. This solution:

1. Maintains the same interface for components
2. Changes the implementation to use Supabase directly
3. Uses an abstraction layer to map between database and frontend types

### Implementation Details

The implementation involves:

- Direct Supabase queries in service files instead of API calls
- Data mappers to convert between database schema and frontend types
- Preservation of existing interfaces so components don't need to change

### Expected API Contract

When the external API becomes available again, it should provide the following endpoints:

- `GET /assets` - List assets with filtering options
- `GET /assets/:id` - Get asset by ID
- `POST /assets` - Create new asset
- `PATCH /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset
- `PATCH /assets/:id/status` - Update asset status
- `GET /status` - Get all status records
- `GET /asset_types` - Get all asset types
- `GET /manufacturers` - Get all manufacturers
- `GET /asset_solutions` - Get all asset solutions

### Follow-up Tasks

- [ ] Monitor the availability of `api.blue.legal`
- [ ] Plan regression tests for when the API returns
- [ ] Evaluate the cost/benefit of maintaining two backends
- [ ] Document lessons learned from this incident

### Rollback Procedure

When the API becomes available:

1. Test API endpoints to ensure they work as expected
2. Revert the changes in service files to use API calls instead of Supabase
3. Remove the temporary mapper utilities if no longer needed
4. Update documentation to reflect the change

## Project Overview

The platform is organized into modular features such as **assets**, **clients**,
**tickets**, **associations**, **dashboard** and **bits**. Each module contains
its own pages, hooks and services under `src/modules`.

### Authentication and User Flow

Users can sign up, log in and manage their sessions through Supabase. Access is
restricted by role and enforced in protected routes. See the detailed
[Fluxo de Autenticação e Autorização](src/docs/AUTH_FLOW.md) and the
[Permissões por Role](src/docs/ROLE_PERMISSIONS.md) reference.

### Theme & Visual Identity

The interface uses the LEGAL design system described in
[`LEGAL_THEME_GUIDE.md`](src/docs/LEGAL_THEME_GUIDE.md). The `NamedLogo`
component applies the brand logo across headers, sidebars and login screens.

## Environment Configuration

This project relies on environment files to configure Supabase.

- `.env.development` contains placeholders for your local Supabase instance.
- `.env.production` stores the remote Supabase credentials.

Copy the file that matches your environment to `.env` before running the app:

```bash
cp .env.development .env   # for local development
cp .env.production .env    # for production builds
```

You can also create a custom `.env` file based on these examples.


## Auth Protection Components

Reusable guard components live in `src/components/auth`. They help enforce authentication and role-based permissions across the application.

```tsx
<AuthRoute requiredRole="admin">
  <AdminPage />
</AuthRoute>
```

See [src/components/auth/README.md](src/components/auth/README.md) for a full list of components and additional examples.

## Getting Started

To run the project locally:

```bash
npm install
cp .env.development .env   # or .env.production
npx supabase start          # requires Supabase CLI
npm run dev
```

Local ports for the API, database and Studio are defined in `supabase/config.toml`.

## Documentação de Autenticação

Para entender como funciona o fluxo de login, controle de sessão e validação de permissões, consulte o documento [Fluxo de Autenticação e Autorização](src/docs/AUTH_FLOW.md).


Para consultar as funcionalidades disponíveis para cada papel, veja [Permissões por Role](src/docs/ROLE_PERMISSIONS.md).

## Changelog

Veja o diretório [src/docs/changelog](src/docs/changelog/) para a lista completa de commits e alterações.
