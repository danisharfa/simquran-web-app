import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { username, admin as adminPlugin } from 'better-auth/plugins';
import { prisma } from '@/lib/prisma';
import { ac, SUPERADMIN, ADMIN, COORDINATOR, TEACHER, STUDENT } from '@/lib/permissions';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        input: false,
      },
    },
  },
  plugins: [
    username(),
    adminPlugin({
      ac,
      roles: {
        SUPERADMIN,
        ADMIN,
        COORDINATOR,
        TEACHER,
        STUDENT,
      },
      // Key di atas (SUPERADMIN, ADMIN, dst) HARUS persis sama dengan
      // nilai string yang tersimpan di kolom `role` database (case-sensitive).
      adminRoles: ['SUPERADMIN', 'ADMIN'],
      // Tanpa ini, plugin admin default ke role "user" saat signup, yang
      // tidak ada di enum Role dan bikin validasi Prisma gagal.
      defaultRole: 'STUDENT',
    }),
  ],
});
