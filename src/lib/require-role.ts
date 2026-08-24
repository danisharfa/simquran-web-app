import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import type { RoleKey } from '@/components/layouts/sidebar-menu';

/**
 * Mengambil session dan memastikan user sudah login.
 * Lempar redirect ke /login kalau tidak ada session.
 */
export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return session;
}

/**
 * Mengambil session DAN memastikan role user termasuk dalam daftar yang diizinkan.
 * Gunakan ini di setiap page.tsx/layout.tsx modul yang butuh restriksi role.
 *
 * Contoh pemakaian di app/dashboard/users/page.tsx:
 *   const session = await requireRole(['superadmin', 'admin']);
 */
export async function requireRole(allowedRoles: RoleKey[]) {
  const session = await requireSession();

  const role = session.user.role.toLowerCase() as RoleKey;

  if (!allowedRoles.includes(role)) {
    redirect('/dashboard'); // atau redirect ke halaman /403 kalau sudah ada
  }

  return session;
}

export async function requireRoleOrThrow(allowedRoles: RoleKey[]) {
  const session = await requireSession();

  const role = session.user.role.toLowerCase() as RoleKey;

  if (!allowedRoles.includes(role)) {
    throw new Error('Unauthorized: user role not allowed');
  }

  return session;
}
