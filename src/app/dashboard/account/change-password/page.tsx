import { requireSession } from '@/lib/require-role';
import { ChangePasswordForm } from '@/features/change-password/change-password-form';

export default async function ChangePasswordPage() {
  await requireSession();

  return (
    <div className="w-full max-w-xl mx-auto">
      <ChangePasswordForm />
    </div>
  );
}
