
# BLUE System

A comprehensive asset and client management system.

## Features

- User authentication and authorization
- Asset management (chips, routers, etc.)
- Client management and asset association
- Dashboard with key metrics
- Comprehensive logging and audit trails

## Development Setup

1. **Clone the repository**
   ```
   git clone https://github.com/your-org/blue-system.git
   cd blue-system
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```
   npm run dev
   ```

5. **Build for production**
   ```
   npm run build
   ```

## Testing

### Unit Tests

Run the unit tests using:
```
npm test
```

### End-to-End Tests

1. Make sure the development server is running:
   ```
   npm run dev
   ```

2. In another terminal, run the E2E tests:
   ```
   npm run test:e2e
   ```

### Testing RLS Policies

To test the Row Level Security policies:

1. Go to the Supabase SQL Editor
2. Create test users with different roles:
   ```sql
   -- Create users with different roles for testing
   INSERT INTO auth.users (id, email) VALUES 
     ('user1-uuid', 'admin@test.com'),
     ('user2-uuid', 'analyst@test.com'),
     ('user3-uuid', 'ops@test.com'),
     ('user4-uuid', 'user@test.com');

   INSERT INTO public.profiles (id, email, role, is_active, is_approved) VALUES
     ('user1-uuid', 'admin@test.com', 'admin', true, true),
     ('user2-uuid', 'analyst@test.com', 'analyst', true, true),
     ('user3-uuid', 'ops@test.com', 'ops', true, true),
     ('user4-uuid', 'user@test.com', 'user', true, true);
   ```

3. Test access patterns by signing in as different users and attempting operations like:
   - Viewing assets (all roles)
   - Creating assets (admin, analyst)
   - Updating assets (admin, ops)
   - Deleting assets (admin only)

4. For detailed testing instructions, see `docs/rls.md`.

## Project Structure

```
blue-system/
├── docs/               # Documentation
│   └── rls.md          # RLS policies documentation
├── public/             # Static assets
├── src/
│   ├── __tests__/      # Unit and integration tests
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-organized modules
│   │   ├── auth/       # Authentication feature
│   │   ├── assets/     # Asset management feature
│   │   ├── clients/    # Client management feature
│   │   └── dashboard/  # Dashboard feature
│   ├── integrations/   # External service integrations
│   ├── pages/          # Page components
│   ├── services/       # Services and API calls
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── supabase/
│   └── migrations/     # Database migrations
└── package.json
```

## Best Practices

### Authentication

- Always check user authentication status with `useAuth()` hook
- Use `useAuthGuard(optionalRole)` to protect routes that require authentication
- For API calls, ensure the user is authenticated before making the request

### Database Operations

- Use retry mechanisms for critical operations
- Always handle errors with appropriate user feedback
- Validate input data before sending to the database
- Follow the RLS policies documented in `docs/rls.md`

### UI Development

- Use Tailwind CSS for styling
- Use ShadCN components where possible
- Ensure all UI is responsive and works on mobile devices

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
