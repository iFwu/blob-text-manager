'use client';

import { useEffect } from 'react';
import { useFileOperations } from '../hooks/useFileOperations';
import Split from 'react-split';

import FileExplorer from '../components/FileExplorer';
import FileEditor from '../components/FileEditor';
import CreateForm from '../components/CreateForm';

export default function Home() {
  const {
    files,
    selectedFile,
    fileContent,
    isFileTreeLoading,
    isFileContentLoading,
    fetchFiles,
    handleFileSelect,
    handleFileSave,
    handleFileDelete,
    handleFolderDelete,
  } = useFileOperations();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="h-screen flex flex-col">
      <div className="px-4 md:container md:mx-auto">
        <h1 className="text-2xl font-bold py-4">Vercel Blob Manager</h1>
        <Split 
          className="flex flex-1 overflow-hidden"
          sizes={[25, 75]}
          minSize={200}
          gutterSize={4}
          snapOffset={30}
        >
          <div className="h-full overflow-auto pr-2">
            <FileExplorer
              files={files}
              onFileSelect={handleFileSelect}
              onFileDelete={handleFileDelete}
              onFolderDelete={handleFolderDelete}
              isLoading={isFileTreeLoading}
              selectedFile={selectedFile}
            />
          </div>
          <div className="h-full overflow-auto pl-6 pt-4">
            <div className="space-y-4">
              <CreateForm
                onCreateFile={(fileName) => handleFileSave('', fileName)}
                currentDirectory={
                  selectedFile
                    ? selectedFile.isDirectory
                      ? selectedFile.pathname
                      : selectedFile.pathname.split('/').slice(0, -1).join('/')
                    : ''
                }
              />
              {!selectedFile?.isDirectory && (
                <FileEditor
                  key={selectedFile?.url}
                  file={selectedFile}
                  content={fileContent}
                  onSave={handleFileSave}
                  isLoading={isFileContentLoading}
                />
              )}
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}
