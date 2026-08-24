import { getOwnProfile } from '@/features/users/queries/get-own-profile';
import { ProfileDetail } from '@/features/users/components/profile-detail';
import { ChangePasswordForm } from '@/features/change-password/change-password-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AccountPage() {
  const user = await getOwnProfile();

  return (
    <Tabs defaultValue="profile" className="mx-auto w-full max-w-3xl">
      <TabsList className="mx-auto">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="password">Ganti Password</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-6">
        <ProfileDetail user={user} />
      </TabsContent>
      <TabsContent value="password">
        <ChangePasswordForm />
      </TabsContent>
    </Tabs>
  );
}
