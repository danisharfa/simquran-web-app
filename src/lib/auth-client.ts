import { createAuthClient } from 'better-auth/react';
import { usernameClient, adminClient } from 'better-auth/client/plugins';
import { ac, SUPERADMIN, ADMIN, COORDINATOR, TEACHER, STUDENT } from '@/lib/permissions';

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    adminClient({
      ac,
      roles: {
        SUPERADMIN,
        ADMIN,
        COORDINATOR,
        TEACHER,
        STUDENT,
      },
    }),
  ],
});

export const { signIn, signOut, useSession } = authClient;
