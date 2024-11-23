import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';

interface FileActionProps {
  onClick: (e: React.MouseEvent) => void;
}

export function FileAction({ onClick }: FileActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <TrashIcon className="h-4 w-4" />
    </Button>
  );
}
