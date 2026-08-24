import { requireSession } from '@/lib/require-role';

export default async function DashboardPage() {
  const session = await requireSession();
  const role = session.user.role.toLowerCase();

  return (
    <div className="space-y-6">
      <h1>Selamat datang, {session.user.name}</h1>

      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
