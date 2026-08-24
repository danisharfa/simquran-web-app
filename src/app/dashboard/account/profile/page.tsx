import { getOwnProfile } from '@/features/users/actions/get-own-profile';
import { ProfileDetail } from '@/features/users/components/profile-detail';

export default async function AccountProfilePage() {
  const user = await getOwnProfile();

  return (
    <div className="space-y-6">
      <ProfileDetail user={user} />
    </div>
  );
}
