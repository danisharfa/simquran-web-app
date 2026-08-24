import { requireRole } from '@/lib/require-role';
import { BackButton } from '@/components/ui/back-button';
import { UserDetail } from '@/features/users/components/user-detail';
import { getUserDetail } from '@/features/users/actions/get-user-detail';
import { ROLE_LABEL } from '@/features/users/user-options';
import type { Role } from '@/lib/generated/prisma/enums';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  await requireRole(['superadmin', 'admin']);
  const { userId } = await params;
  const user = await getUserDetail(userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/dashboard/users" />
        <h1 className="text-2xl font-bold">
          {ROLE_LABEL[user.role as Role] ?? user.role} - {user.name}
        </h1>
      </div>

      <UserDetail user={user} />
    </div>
  );
}
