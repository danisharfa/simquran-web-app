'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { UserDetail } from './user-detail';
import { getUserDetail, type UserDetail as UserDetailData } from '../actions/get-user-detail';
import { ROLE_LABEL } from '../user-options';
import type { Role } from '@/lib/generated/prisma/enums';
import { toast } from 'sonner';

interface UserDetailDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserDetailDialog({ userId, open, onOpenChange, onSuccess }: UserDetailDialogProps) {
  const [user, setUser] = useState<UserDetailData | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    getUserDetail(userId)
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Gagal memuat data pengguna');
          onOpenChange(false);
        }
      });

    return () => {
      cancelled = true;
      setUser(null);
    };
  }, [open, userId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {user ? `${ROLE_LABEL[user.role as Role] ?? user.role} - ${user.name}` : 'Detail Pengguna'}
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : (
          <UserDetail user={user} onSuccess={onSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
