import { useState, useEffect } from 'react';
import { Loader2, Save, X, Check } from 'lucide-react';

import { BlobFile } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAnimatedState } from '@/hooks/useAnimatedState';

interface FileEditorProps {
  file: BlobFile | null;
  content: string;
  onSave: (content: string) => Promise<void>;
  isLoading?: boolean;
  onClose: () => void;
}

export const ZERO_WIDTH_SPACE = '\u200B';

export default function FileEditor({
  file,
  content,
  onSave,
  isLoading = false,
  onClose,
}: FileEditorProps) {
  const editorKey = file?.pathname || 'no-file';
  const [editedContent, setEditedContent] = useState(content);
  const { state: buttonState, startLoading, setSuccess, reset } = useAnimatedState();

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = async () => {
    if (buttonState === 'loading') return;

    startLoading();
    try {
      await onSave(editedContent);
      await setSuccess();
    } catch (error) {
      console.error('Failed to save file:', error);
      let errorMessage = 'Failed to save the file.';
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      reset();
    }
  };

  if (!file) {
    return (
      <Card className="w-full h-full flex items-center justify-center p-4">
        <p className="text-muted-foreground text-base">Select a file to edit</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card
      key={editorKey}
      className="w-full h-full flex flex-col relative"
      role="region"
      aria-label="File editor"
    >
      <CardHeader className="p-3 border-b flex items-center justify-center h-14 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={buttonState === 'loading'}
          aria-label="Close editor"
          title="Close editor"
          className={cn(
            'absolute left-3 top-3 rounded-full h-8 pl-1.5 pr-2',
            'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
            'transition-all duration-200 ease-in-out',
            'group flex items-center gap-0'
          )}
        >
          <X
            className={cn(
              'h-4 w-4',
              'transition-all duration-200 group-hover:scale-90'
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'w-0 overflow-hidden opacity-0',
              'group-hover:w-10 group-hover:opacity-100',
              'transition-all duration-200'
            )}
          >
            Close
          </span>
        </Button>
        <CardTitle className="text-lg font-semibold">
          Editing: {file.pathname}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 relative">
        <Textarea
          className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          aria-label={`Edit content of ${file.pathname}`}
          title={`Edit content of ${file.pathname}`}
        />
        <div className="absolute bottom-4 right-4">
          <Button
            onClick={handleSave}
            disabled={buttonState === 'loading'}
            aria-label={
              buttonState === 'loading'
                ? 'Saving...'
                : buttonState === 'success'
                ? 'Saved!'
                : 'Save changes'
            }
            title={
              buttonState === 'loading'
                ? 'Saving...'
                : buttonState === 'success'
                ? 'Saved!'
                : 'Save changes'
            }
            className={cn(
              'rounded-full w-10 h-10',
              'bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-600',
              'transition-all duration-300 ease-in-out hover:w-[5.5rem]',
              'group flex items-center justify-center gap-0 overflow-hidden'
            )}
          >
            {buttonState === 'loading' ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : buttonState === 'success' ? (
              <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : (
              <>
                <Save
                  className={cn(
                    'h-5 w-5 shrink-0',
                    'transition-all duration-300 ease-in-out',
                    'group-hover:mr-1.5 group-hover:scale-90'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'w-0 overflow-hidden opacity-0',
                    'group-hover:w-10 group-hover:opacity-100',
                    'transition-all duration-300 ease-in-out'
                  )}
                >
                  Save
                </span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
