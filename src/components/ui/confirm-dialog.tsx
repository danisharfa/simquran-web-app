'use client';

import { useState, type ReactElement } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  title: string;
  description: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  onConfirm: () => Promise<void> | void;
  trigger: ReactElement;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Konfirmasi',
  confirmingLabel = 'Memproses...',
  onConfirm,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleConfirm() {
    setIsConfirming(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? confirmingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
