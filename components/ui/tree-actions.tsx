import { Button } from '@/components/ui/button';
import { TrashIcon, PlusIcon } from 'lucide-react';

interface FileActionProps {
  onDelete: (e: React.MouseEvent) => void;
}

interface DirectoryActionProps extends FileActionProps {
  onAdd: (e: React.MouseEvent) => void;
  onFileSelect: (value: null) => void;
}

export function FileAction({ onDelete }: FileActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(e);
      }}
    >
      <TrashIcon className="h-4 w-4" />
    </Button>
  );
}

export function DirectoryAction({ onDelete, onAdd, onFileSelect }: DirectoryActionProps) {
  return (
    <div className="flex space-x-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(e);
          onFileSelect(null);
        }}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(e);
        }}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
