# Auth Protection Components

This folder contains reusable components to protect routes and interface elements.
They rely on `AuthProvider` and `useAuth` to read the current user session.

## Components

- **AuthRoute** – Wraps a route element and redirects to `/login` when the user
  is not authenticated. You can specify a `requiredRole` to restrict access.
- **PrivateRoute** – Simplified variant that defaults to the `admin` role.
- **ProtectedRoute** – Displays optional fallback content or the
  `InsufficientPermissions` message when the user lacks permission.
- **RoleGuard** – Conditionally renders its children based on role checks.
- **PermissionButton** – Button that becomes disabled with a tooltip when the
  user does not have the required role.
- **InsufficientPermissions** – Standard alert shown by the guards when access is
  denied.

## Usage Examples

### Protecting a Route
```tsx
<Route
  path="/admin"
  element={
    <AuthRoute requiredRole="admin">
      <AdminPage />
    </AuthRoute>
  }
/>
```

### Conditional Rendering
```tsx
<RoleGuard requiredRole="suporte">
  <SensitiveComponent />
</RoleGuard>
```

### Button with Permission Check
```tsx
<PermissionButton requiredRole="admin" tooltip="Somente administradores">
  Ação Restrita
</PermissionButton>
```

### Custom Message with ProtectedRoute
```tsx
<ProtectedRoute requiredRole="suporte" customMessage="Acesso apenas para suporte">
  <SupportPage />
</ProtectedRoute>
```
