'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Split from 'react-split';

import CreateForm from '@/components/CreateForm';
import FileEditor from '@/components/FileEditor';
import FileExplorer from '@/components/FileExplorer';
import { OperationConfirmDialog } from '@/components/OperationConfirmDialog';
import { toast } from '@/components/ui/use-toast';
import { useFileOperations } from '@/hooks/useFileOperations';
import { ZERO_WIDTH_SPACE } from '@/lib/const';
import type { BlobFile } from '@/types';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { Button } from '../components/ui/button';

type PendingOperation = {
  type: 'select' | 'create';
  data: {
    fileName?: string;
    file?: BlobFile | null;
  };
  promise: {
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: Error) => void;
  };
  confirmed: boolean;
};

export default function Home() {
  const {
    files,
    selectedFile,
    fileContent,
    isFileTreeLoading,
    isFileContentLoading,
    deletingFiles,
    fetchFiles,
    handleFileSelect,
    handleFileSave,
    handleFileDelete,
    handleDeleteAll,
    validateFileName,
  } = useFileOperations();

  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  const [pendingOperation, setPendingOperation] =
    useState<PendingOperation | null>(null);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleSetCreateTarget = useCallback(
    (directoryPath: string) => {
      handleFileSelect(null);
      setTargetPath(directoryPath);
    },
    [handleFileSelect]
  );

  const createPendingPromise = useCallback(() => {
    let resolver: ((value: void | PromiseLike<void>) => void) | undefined;
    let rejecter: ((reason?: Error) => void) | undefined;

    const promise = new Promise<void>((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });

    if (!resolver || !rejecter) throw new Error('Promise not initialized');

    return {
      promise,
      resolve: resolver,
      reject: rejecter,
    };
  }, []);

  const handleCreateFile = useCallback(
    async (fileName: string) => {
      if (isEditorDirty) {
        const { promise, resolve, reject } = createPendingPromise();
        setPendingOperation({
          type: 'create',
          data: { fileName },
          promise: { resolve, reject },
          confirmed: false,
        });
        return promise;
      }

      setTargetPath(null);
      await handleFileSave({
        content: ZERO_WIDTH_SPACE,
        pathname: fileName,
        isEditing: false,
      });
    },
    [handleFileSave, isEditorDirty, createPendingPromise]
  );

  const handleFileSelectWithConfirm = useCallback(
    (file: BlobFile | null) => {
      if (isEditorDirty && file?.pathname !== selectedFile?.pathname) {
        const { promise, resolve, reject } = createPendingPromise();
        setPendingOperation({
          type: 'select',
          data: { file },
          promise: { resolve, reject },
          confirmed: false,
        });
        return promise;
      }

      if (file !== null) {
        setTargetPath(null);
      }
      return handleFileSelect(file);
    },
    [
      handleFileSelect,
      isEditorDirty,
      selectedFile?.pathname,
      createPendingPromise,
    ]
  );

  const handleConfirmOperation = useCallback(() => {
    if (!pendingOperation) return;

    const { type, data, promise } = pendingOperation;
    setPendingOperation(null);
    setIsEditorDirty(false);

    switch (type) {
      case 'select':
        handleFileSelect(data as BlobFile | null);
        promise.resolve();
        break;
      case 'create':
        setTargetPath(null);
        if (!data.fileName) throw new Error('File name is required');
        handleFileSave({
          content: ZERO_WIDTH_SPACE,
          pathname: data.fileName,
          isEditing: false,
        })
          .then(promise.resolve)
          .catch(promise.reject);
        break;
    }
  }, [pendingOperation, handleFileSelect, handleFileSave]);

  const handleCancelOperation = useCallback(() => {
    if (!pendingOperation) return;
    pendingOperation.promise.reject(new Error('Operation cancelled'));
    setPendingOperation(null);
  }, [pendingOperation]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="h-screen flex flex-col">
      <div className="px-4 md:container md:mx-auto">
        <h1 className="text-2xl font-bold py-4">Blob Text Manager</h1>
        <Split
          className="flex flex-1 overflow-hidden"
          sizes={[25, 75]}
          minSize={200}
          gutterSize={3}
          snapOffset={30}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">Files</h2>
                  {deletingFiles.size > 0 && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                  className="h-8 w-8"
                  aria-label="Delete all files"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-full overflow-auto pr-2">
                <FileExplorer
                  files={files}
                  onFileSelect={handleFileSelectWithConfirm}
                  onFileDelete={handleFileDelete}
                  onSetCreateTarget={handleSetCreateTarget}
                  isLoading={isFileTreeLoading}
                  selectedFile={selectedFile}
                />
              </div>
            </div>
          </div>
          <div className="h-full overflow-auto pl-6 pt-4">
            <div className="space-y-4">
              <CreateForm
                onCreateFile={handleCreateFile}
                currentDirectory={
                  selectedFile
                    ? selectedFile.isDirectory
                      ? selectedFile.pathname
                      : selectedFile.pathname.split('/').slice(0, -1).join('/')
                    : ''
                }
                targetPath={targetPath}
                validateFileName={validateFileName}
              />
              <FileEditor
                key={selectedFile?.pathname}
                file={selectedFile?.isDirectory ? null : selectedFile}
                content={fileContent === ZERO_WIDTH_SPACE ? '' : fileContent}
                onSave={async (content) => {
                  if (!selectedFile) {
                    toast({
                      title: 'Error',
                      description: 'Please select a file to save',
                      variant: 'destructive',
                    });
                    throw new Error('Please select a file to save');
                  }
                  if (content === '' || content.trim() === ZERO_WIDTH_SPACE) {
                    toast({
                      title: 'Error',
                      description: 'File content cannot be empty',
                      variant: 'destructive',
                    });
                    throw new Error('File content cannot be empty');
                  }
                  await handleFileSave({
                    content,
                    pathname: selectedFile.pathname,
                    isEditing: true,
                  });
                }}
                onClose={() => handleFileSelect(null)}
                isLoading={isFileContentLoading}
                onDirtyChange={setIsEditorDirty}
              />
            </div>
          </div>
        </Split>
      </div>
      <OperationConfirmDialog
        open={!!pendingOperation}
        onOpenChange={(open) => {
          if (!open && pendingOperation) {
            const clickedCancelOrOutside = !pendingOperation.confirmed;
            if (clickedCancelOrOutside) {
              handleCancelOperation();
            }
          }
        }}
        onConfirm={() => {
          if (pendingOperation) {
            pendingOperation.confirmed = true;
            handleConfirmOperation();
          }
        }}
        title="Unsaved Changes"
        description="You have unsaved changes in the current file. Do you want to continue without saving?"
      />

      <DeleteConfirmDialog
        isOpen={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
        onConfirm={async () => {
          try {
            await handleDeleteAll();
            toast({
              title: 'Success',
              description: 'All files have been deleted',
            });
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to delete all files',
              variant: 'destructive',
            });
          }
        }}
        itemType="all"
      />
    </div>
  );
}
