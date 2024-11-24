'use client';

import { useState, useCallback, useEffect } from 'react';
import Split from 'react-split';
import FileExplorer from '@/components/FileExplorer';
import CreateForm from '@/components/CreateForm';
import FileEditor from '@/components/FileEditor';
import { useFileOperations } from '@/hooks/useFileOperations';
import { Loader2 } from 'lucide-react';

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
  } = useFileOperations();

  const [initialPath, setInitialPath] = useState<string>();

  const handleAddDirectory = useCallback((directoryPath: string) => {
    handleFileSelect(null);
    setInitialPath(directoryPath);
  }, [handleFileSelect]);

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
          gutterSize={4}
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
                  onAddDirectory={handleAddDirectory}
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
                  setInitialPath(undefined);
                  return handleFileSave('', fileName);
                }}
                currentDirectory={
                  selectedFile
                    ? selectedFile.isDirectory
                      ? selectedFile.pathname
                      : selectedFile.pathname.split('/').slice(0, -1).join('/')
                    : ''
                }
                initialPath={initialPath}
              />
              <FileEditor
                key={selectedFile?.url}
                file={selectedFile?.isDirectory ? null : selectedFile}
                content={fileContent}
                onSave={handleFileSave}
                isLoading={isFileContentLoading}
              />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}
