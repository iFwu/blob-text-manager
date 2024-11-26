import {
  FormEvent,
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, FolderPlusIcon, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValidateFileNameParams, ValidationResult } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAnimatedState } from '@/hooks/useAnimatedState';

interface CreateFormProps {
  onCreateFile: (fileName: string) => Promise<void>;
  currentDirectory: string;
  targetPath?: string;
  validateFileName: (params: ValidateFileNameParams) => ValidationResult;
}

const CreateForm = memo(function CreateForm({
  onCreateFile,
  currentDirectory,
  targetPath,
  validateFileName,
}: CreateFormProps) {
  const [newName, setNewName] = useState('');
  const [prefixWidth, setPrefixWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const {
    state: fileButtonState,
    startLoading: startFileLoading,
    setSuccess: setFileSuccess,
    reset: resetFileState,
  } = useAnimatedState();
  const {
    state: folderButtonState,
    startLoading: startFolderLoading,
    setSuccess: setFolderSuccess,
    reset: resetFolderState,
  } = useAnimatedState();

  const prefixRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveDirectory = targetPath || currentDirectory;

  useEffect(() => {
    if (prefixRef.current) {
      const width = prefixRef.current.getBoundingClientRect().width;
      setPrefixWidth(width);
    }
    if (targetPath) {
      inputRef.current?.focus();
    }
  }, [effectiveDirectory, targetPath]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewName(e.target.value);
      setError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (isDirectory: boolean) => {
      const currentState = isDirectory ? folderButtonState : fileButtonState;
      if (currentState === 'loading') return;

      if (!newName) {
        setError('Please enter a name');
        return;
      }

      const fileName = isDirectory ? `${newName}/` : newName;
      const fullPath = effectiveDirectory
        ? `${effectiveDirectory.replace(/\/+$/, '')}/${fileName}`.replace(
            /\/+/g,
            '/'
          )
        : fileName;

      const validation = validateFileName({
        pathname: fullPath,
        isEditing: false,
      });
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      if (isDirectory) {
        startFolderLoading();
      } else {
        startFileLoading();
      }

      try {
        await onCreateFile(fullPath);
        setNewName('');
        setError(null);
        if (isDirectory) {
          setFolderSuccess();
        } else {
          setFileSuccess();
        }
      } catch (error) {
        console.error('Failed to create:', error);
        let errorMessage = `Failed to create ${isDirectory ? 'folder' : 'file'}.`;
        if (error instanceof Error) {
          errorMessage += ` Error: ${error.message}`;
        }
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        if (isDirectory) {
          resetFolderState();
        } else {
          resetFileState();
        }
      } finally {
        inputRef.current?.focus();
      }
    },
    [
      newName,
      effectiveDirectory,
      validateFileName,
      onCreateFile,
      fileButtonState,
      folderButtonState,
      startFileLoading,
      startFolderLoading,
      setFileSuccess,
      setFolderSuccess,
      resetFileState,
      resetFolderState,
    ]
  );

  const handleFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      handleSubmit(false);
    },
    [handleSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e.shiftKey);
      }
    },
    [handleSubmit]
  );

  const isProcessing =
    fileButtonState === 'loading' || folderButtonState === 'loading';

  return (
    <form onSubmit={handleFormSubmit} className="space-y-2">
      <fieldset disabled={isProcessing}>
        <div className="flex relative">
          {effectiveDirectory && (
            <span
              ref={prefixRef}
              aria-label="current directory"
              className={cn(
                'inline-flex items-center absolute left-0 top-0 bottom-0',
                'text-sm text-muted-foreground bg-muted',
                'border border-r-0 border-input rounded-l-md',
                'truncate px-3 font-mono'
              )}
            >
              {effectiveDirectory.replace(/\/+$/, '')}/
            </span>
          )}
          <Input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter name... (Shift+Enter for folder)"
            aria-invalid={!!error}
            aria-describedby={error ? 'name-error' : undefined}
            className={cn(
              'pr-[80px]',
              effectiveDirectory && 'pl-[var(--prefix-width)]',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            style={
              {
                '--prefix-width': `${prefixWidth + 10}px`,
              } as React.CSSProperties
            }
            disabled={isProcessing}
          />
          <div className="absolute right-0 top-0 bottom-0 flex">
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="rounded-none hover:bg-transparent"
              disabled={isProcessing}
              title="Create File (Enter)"
              aria-label="Create new file"
            >
              {fileButtonState === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : fileButtonState === 'success' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              className="rounded-l-none"
              disabled={isProcessing}
              onClick={() => handleSubmit(true)}
              title="Create Folder (Shift+Enter)"
              aria-label="Create new folder"
            >
              {folderButtonState === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : folderButtonState === 'success' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <FolderPlusIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {error && (
          <p
            id="name-error"
            className="text-sm text-destructive mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </fieldset>
    </form>
  );
});

export default CreateForm;
