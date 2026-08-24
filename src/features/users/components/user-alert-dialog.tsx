'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { resetUserPassword } from '../actions/reset-password';
import { deleteUser } from '../actions/delete-user';

interface UserAlertDialogProps {
  user: { id: string };
  type: 'reset' | 'delete';
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function UserAlertDialog({
  user,
  type,
  open,
  onOpenChange,
  onConfirm,
}: UserAlertDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    setLoading(true);

    try {
      const result =
        type === 'reset' ? await resetUserPassword(user.id) : await deleteUser(user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(result.message);

      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{type === 'reset' ? 'Reset Password' : 'Hapus User'}</AlertDialogTitle>
          <AlertDialogDescription>
            {type === 'reset'
              ? 'Apakah Anda yakin ingin mereset password user ini?'
              : 'Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={loading}>
            {loading ? 'Loading...' : type === 'reset' ? 'Reset' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
