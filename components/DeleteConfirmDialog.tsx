import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useState } from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemType: 'file' | 'folder' | 'all' | null;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  itemType,
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isDeleteAllType) {
        onConfirm();
        onOpenChange(false);
      }
    },
    [onConfirm, onOpenChange]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setConfirmText('');
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const isDeleteAllType = itemType === 'all';
  const isConfirmValid = !isDeleteAllType || confirmText === 'delete all';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={isDeleteAllType ? 'text-red-600' : ''}>
            {isDeleteAllType ? '⚠️ Dangerous Operation' : 'Are you sure?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {isDeleteAllType ? (
              <>
                <p className="font-semibold text-red-500">
                  This is a destructive action that cannot be undone. All files
                  and folders in the system will be permanently deleted.
                </p>
                <p>To confirm this action, please type "delete all" below:</p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'delete all' to confirm"
                  className="mt-2"
                />
              </>
            ) : (
              <>
                This action cannot be undone. This will permanently delete the
                {itemType === 'folder'
                  ? ' folder and all its contents'
                  : ' file'}
                .
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (isConfirmValid) {
                onConfirm();
              }
            }}
            disabled={!isConfirmValid}
            className={isDeleteAllType ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
