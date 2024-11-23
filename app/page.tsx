'use client';

import { useEffect } from 'react';
import { useFileOperations } from '../hooks/useFileOperations';

import FileTree from '../components/FileTree';
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vercel Blob Manager</h1>
      <div className="flex">
        <div className="w-1/4 pr-4">
          <FileTree
            files={files}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
            onFolderDelete={handleFolderDelete}
            isLoading={isFileTreeLoading}
            selectedFile={selectedFile}
          />
        </div>
        <div className="w-3/4">
          <div className="mb-4">
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
          </div>
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
    </div>
  );
}
