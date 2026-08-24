# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Database:**
```bash
npx prisma migrate dev      # Run migrations
npx prisma migrate dev --name <name>  # Create new migration
npx prisma db seed          # Seed database
npx prisma studio           # Open Prisma Studio
```

**Prisma client is generated to `src/lib/generated/prisma/`** — run `npx prisma generate` after schema changes.

## Architecture

This is a school management system (SimQuran v2) built with Next.js 15 App Router, using **better-auth** for authentication, **Prisma** for the database (MySQL/MariaDB), and shadcn/ui for UI components.

### Authentication (better-auth)

Authentication uses **better-auth** with the `username` and `admin` plugins — users log in with username, not email. The auth instance is in [src/lib/auth.ts](src/lib/auth.ts) (server) and [src/lib/auth-client.ts](src/lib/auth-client.ts) (client).

**Roles** (stored uppercase in DB): `SUPERADMIN`, `ADMIN`, `COORDINATOR`, `TEACHER`, `STUDENT`
- `SUPERADMIN` and `ADMIN` have full user management permissions (via better-auth admin plugin)
- `COORDINATOR`, `TEACHER`, `STUDENT` have no admin permissions but must still be registered in `permissions.ts`

**Page protection** — use server-side helpers from [src/lib/require-role.ts](src/lib/require-role.ts):
- `requireSession()` — redirects to `/login` if not authenticated
- `requireRole(['superadmin', 'admin'])` — redirects to `/dashboard` if wrong role (roles passed lowercase)
- `requireRoleOrThrow(roles)` — throws instead of redirecting; use in Server Actions

### User Creation Pattern

Users are created in two phases (see [src/features/users/actions/create-user.ts](src/features/users/actions/create-user.ts)):
1. `auth.api.createUser()` — creates the auth identity
2. Prisma creates the role-specific profile (`CoordinatorProfile`, `TeacherProfile`, `StudentProfile`)

If phase 2 fails, phase 1 is rolled back manually via `auth.api.removeUser()`. Default email/password are auto-generated from username (`${username}@sekolah.local` / `username`).

### Feature Structure

Each feature lives in `src/features/<name>/` with:
- `actions/` — Next.js Server Actions (`'use server'`)
- `components/` — React components specific to that feature
- `*.schema.ts` — Zod validation schemas

### Form Pattern

Forms use **@tanstack/react-form** with Zod validators:
```tsx
const form = useForm({
  defaultValues: { ... },
  validators: { onSubmit: zodSchema },
  onSubmit: async ({ value }) => { ... },
});
```

Custom field components: `Field`, `FieldLabel`, `FieldError`, `FieldGroup` from `@/components/ui/field`; `InputGroup`, `InputGroupAddon`, `InputGroupInput`, `InputGroupButton` from `@/components/ui/input-group`.

### UI Conventions

- **Language**: Indonesian UI text (`"Masuk"`, `"Keluar"`, `"Berhasil login!"`, etc.)
- **Toasts**: `toast.success()` / `toast.error()` from `sonner`
- **Styling**: Tailwind CSS v4, shadcn/ui with base-nova theme, `cn()` utility from `@/lib/utils`
- **Icons**: `lucide-react`
- **Path alias**: `@/*` maps to `src/*`

### Database Schema

Key models in `prisma/schema.prisma`:
- `User` — core user with `role`, `username`, `displayUsername`, profile fields
- `Session`, `Account`, `Verification` — managed by better-auth
- `CoordinatorProfile` / `TeacherProfile` — linked by `userId`, contain `nip`
- `StudentProfile` — linked by `userId`, contains `nis`, `nisn`, `classroomId`, `status`
- `AcademicSetting` — singleton school configuration (year, semester, principal)

### Route Map

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/dashboard` | Redirects to role-appropriate dashboard (not yet built) |
| `/dashboard/users` | User management (superadmin/admin only) |
| `/dashboard/change-password` | Password change |
| `/api/auth/[...all]` | better-auth handler |
| `/api/health` | Health check |
