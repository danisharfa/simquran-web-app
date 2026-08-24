import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// SUPERADMIN dan ADMIN punya hak yang SAMA (sesuai kebutuhan bisnis):
// keduanya boleh create, list, update, delete, set-role, set-password
// user lain secara bebas. Tidak ada perbedaan granular di antara mereka.
const fullUserAccess = ac.newRole({
  user: ['create', 'list', 'set-role', 'get', 'update', 'set-password', 'delete', 'ban', 'impersonate'],
  session: ['list', 'revoke', 'delete'],
});

export const SUPERADMIN = fullUserAccess;
export const ADMIN = fullUserAccess;

// COORDINATOR, TEACHER, STUDENT: tidak punya kontrol admin atas user lain.
// Tetap wajib didefinisikan di sini karena better-auth admin plugin
// mewajibkan SEMUA role yang ada di database (lihat Role enum Prisma)
// terdaftar di 'roles', bukan hanya yang masuk adminRoles.
export const COORDINATOR = ac.newRole({});
export const TEACHER = ac.newRole({});
export const STUDENT = ac.newRole({});