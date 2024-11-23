import { FormEvent, useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, FolderPlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateFormProps {
  onCreateFile: (fileName: string) => Promise<void>;
  currentDirectory: string;
}

const CreateForm = memo(function CreateForm({ onCreateFile, currentDirectory }: CreateFormProps) {
  const [newName, setNewName] = useState('');
  const [prefixWidth, setPrefixWidth] = useState(0);
  const prefixRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefixRef.current) {
      const width = prefixRef.current.getBoundingClientRect().width;
      setPrefixWidth(width);
    }
  }, [currentDirectory]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }, []);

  const handleSubmit = useCallback((isDirectory: boolean) => {
    if (newName) {
      const fileName = isDirectory ? `${newName}/` : newName;
      const cleanDirectory = currentDirectory.endsWith('/') ? currentDirectory.slice(0, -1) : currentDirectory;
      const fullPath = cleanDirectory ? `${cleanDirectory}/${fileName}` : fileName;
      onCreateFile(fullPath);
    }
    setNewName('');
    inputRef.current?.focus();
  }, [newName, currentDirectory, onCreateFile]);

  const handleFormSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    handleSubmit(false);
  }, [handleSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e.shiftKey);
    }
  }, [handleSubmit]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-2">
      <div className="flex relative">
        {currentDirectory && (
          <span
            ref={prefixRef}
            className={cn(
              'inline-flex items-center absolute left-0 top-0 bottom-0',
              'text-sm text-muted-foreground bg-muted',
              'border border-r-0 border-input rounded-l-md',
              'truncate px-3 font-mono'
            )}
          >
            {currentDirectory.replace(/\/+$/, '')}/
          </span>
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter name... (Shift+Enter for folder)"
          value={newName}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn('pr-[80px]', currentDirectory && 'pl-[var(--prefix-width)]')}
          style={{ '--prefix-width': `${prefixWidth + 10}px` } as React.CSSProperties}
        />
        <div className="absolute right-0 top-0 bottom-0 flex">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-none hover:bg-transparent"
            onClick={() => handleSubmit(false)}
            title="Create File (Enter)"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="rounded-l-none"
            onClick={() => handleSubmit(true)}
            title="Create Folder (Shift+Enter)"
          >
            <FolderPlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
});

export default CreateForm;
