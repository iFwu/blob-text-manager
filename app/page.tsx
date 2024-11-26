'use client';

import { useState, useCallback, useEffect } from 'react';
import Split from 'react-split';
import { Loader2 } from 'lucide-react';

import FileExplorer from '@/components/FileExplorer';
import CreateForm from '@/components/CreateForm';
import FileEditor from '@/components/FileEditor';
import { useFileOperations } from '@/hooks/useFileOperations';
import { toast } from '@/components/ui/use-toast';
import { ZERO_WIDTH_SPACE } from '@/lib/const';

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
    validateFileName,
  } = useFileOperations();

  const [targetPath, setTargetPath] = useState<string>();

  const handleSetCreateTarget = useCallback(
    (directoryPath: string) => {
      handleFileSelect(null);
      setTargetPath(directoryPath);
    },
    [handleFileSelect]
  );

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
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">Files</h2>
                {deletingFiles.size > 0 && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="h-full overflow-auto pr-2">
                <FileExplorer
                  files={files}
                  onFileSelect={handleFileSelect}
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
                onCreateFile={(fileName) => {
                  setTargetPath(undefined);
                  return handleFileSave({
                    content: ZERO_WIDTH_SPACE,
                    pathname: fileName,
                    isEditing: false,
                  });
                }}
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
                content={fileContent}
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
              />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}
