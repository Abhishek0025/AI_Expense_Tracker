# Authentication Setup

## Environment Variables

Add the following to your `.env` file:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Database Migration

Run the migration to add the `passwordHash` field to the User model:

```bash
npm run prisma:migrate
```

This will:
1. Add the `passwordHash` column to the User table
2. Set a temporary password for existing users (they should reset their password)

## Seeding

After migration, run the seed to create a demo user:

```bash
npm run prisma:seed
```

This creates a demo user with:
- Email: `demo@local.dev`
- Password: `demo123`

**Note:** In production, users should register through the `/register` page.

## Testing Authentication

1. Start the dev server: `npm run dev`
2. Navigate to `/register` to create a new account
3. Or use the demo account: `demo@local.dev` / `demo123`
4. Protected routes will redirect to `/login` if not authenticated

## Protected Routes

The following routes require authentication:
- `/dashboard`
- `/transactions` (and all sub-routes)
- `/upload`
- All API routes under `/api/transactions`, `/api/ai`, `/api/dashboard`

## API Authentication

All API routes use `requireUser()` which:
- Returns the authenticated user if logged in
- Returns 401 Unauthorized if not logged in

Example:
```typescript
import { requireUser } from '@/lib/auth'

export async function GET() {
  const user = await requireUser()
  const userId = user.id
  // ... use userId
}
```

