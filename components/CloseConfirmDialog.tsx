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
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CloseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSaveAndClose: () => void;
}

export function CloseConfirmDialog({
  open,
  onOpenChange,
  onDiscard,
  onSaveAndClose,
}: CloseConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Unsaved Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <AlertDialogCancel asChild>
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="outline" 
              onClick={onDiscard}
              className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive bg-background"
            >
              Discard
            </Button>
          </AlertDialogAction>
          <AlertDialogAction asChild>
            <Button 
              variant="default" 
              onClick={onSaveAndClose}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save and Close
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

