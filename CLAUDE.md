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

**`superadmin` always bypasses the role check** in both helpers, regardless of the `allowedRoles` list passed — it has full access to every management page/action (users, classrooms, academic settings, quran-reference, etc.), so you never need to add `'superadmin'` explicitly to a list. Write role checks as just `['admin']`, `['admin', 'coordinator']`, etc. for the intended roles — `superadmin` is implied.

Caveat for future **personal/profile-bound pages** (a teacher's own group, a student's own report — anything reading `session.user`'s own `TeacherProfile`/`CoordinatorProfile`/`StudentProfile`): the bypass means `requireRole(['teacher'])` will *not* stop a superadmin from reaching that page, but superadmin has no such profile row, so the page will have no data to show. Guard those by checking the profile record exists (not just the role) before rendering, rather than assuming the role check alone is sufficient.

### User Creation Pattern

Users are created in two phases (see [src/features/users/actions/create-user.ts](src/features/users/actions/create-user.ts)):
1. `auth.api.createUser()` — creates the auth identity
2. Prisma creates the role-specific profile (`CoordinatorProfile`, `TeacherProfile`, `StudentProfile`)

If phase 2 fails, phase 1 is rolled back manually via `auth.api.removeUser()`. Default email/password are auto-generated from username (`${username}@sekolah.local` / `username`).

### Feature Structure

Each feature lives in `src/features/<name>/` with:
- `queries/` — read-only data fetching (`list-*`, `get-*`), **no** `'use server'` directive. Plain async functions called directly from Server Components (`page.tsx`). Still enforce access control via `requireRoleOrThrow`/`requireSession` inside the function.
- `actions/` — Next.js Server Actions (`'use server'`) for mutations (`create-*`, `update-*`, `delete-*`, etc.), plus any read (`get-*`) that is called at runtime from a Client Component (e.g. inside `useEffect`/event handler) — those must stay Server Actions since that's the only client→server RPC mechanism in the App Router.
- `components/` — React components specific to that feature
- `*.schema.ts` — Zod validation schemas

**Why the split**: Server Actions are designed for mutations and always go through a POST-based RPC boundary, which bypasses Next.js's data cache. Plain query functions called from Server Components run as a normal in-process call and can use `unstable_cache`/React `cache()` where useful. Only reach for `'use server'` on a read when a Client Component needs to call it directly.

### Refreshing Data After a Mutation

Calling a Server Action does **not** automatically refresh the page — every mutating action must pair two things or the UI keeps showing stale data after a successful save:
1. **Server side** — call `revalidatePath(path)` at the end of the action (after the mutation succeeds), pointing at the page(s) that read the mutated data. Use the `'layout'` type (`revalidatePath('/dashboard', 'layout')`) when the change affects data rendered in a layout, e.g. the sidebar footer showing the logged-in user's name/username.
2. **Client side** — call `router.refresh()` (from `next/navigation`) after the action resolves successfully, so the Router Cache is told to refetch. `revalidatePath` alone only invalidates the cache; without `router.refresh()` on the client the currently-mounted page won't refetch until the user navigates away and back.

See [assign-students-to-classroom.ts](src/features/classrooms/actions/assign-students-to-classroom.ts) + [add-student-to-classroom-form.tsx](src/features/classrooms/components/add-student-to-classroom-form.tsx) for the reference pattern.

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

### Code Comments

Only comment where the code itself can't explain the "why" (a non-obvious constraint, a workaround, a business rule). Keep it to one short line — no paragraphs, no restating what the code already says.

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
