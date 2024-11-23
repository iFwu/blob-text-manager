import { useCallback, useRef } from 'react';
import { listBlobs, getBlob, putBlob, deleteBlob } from '../app/actions';
import { BlobFile } from '../types';
import { useFileState } from './useFileState';
import { useLoading } from './useLoading';

export function useFileOperations() {
  const { files, selectedFile, fileContent, updateFiles, updateSelectedFile, updateFileContent } =
    useFileState();

  const {
    isFileTreeLoading,
    isFileContentLoading,
    startFileTreeLoading,
    stopFileTreeLoading,
    startFileContentLoading,
    stopFileContentLoading,
  } = useLoading();

  const pendingDeletions = useRef(new Set<string>());
  const pendingOperations = useRef(new Map<string, Promise<any>>());

  const fetchFiles = useCallback(async () => {
    const operationKey = 'fetchFiles';
    if (pendingOperations.current.has(operationKey)) {
      return pendingOperations.current.get(operationKey);
    }

    startFileTreeLoading();
    try {
      const blobList = await listBlobs();
      const filteredFiles = blobList.filter((file) => !pendingDeletions.current.has(file.pathname));
      updateFiles(filteredFiles);
    } catch (error) {
      console.error('Error fetching file list:', error);
      throw error;
    } finally {
      stopFileTreeLoading();
      pendingOperations.current.delete(operationKey);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (file: BlobFile | null) => {
      updateSelectedFile(file);
      updateFileContent('');

      if (!file || file.isDirectory || !file.url) {
        return;
      }

      const operationKey = `fetchContent:${file.pathname}`;
      if (pendingOperations.current.has(operationKey)) {
        return pendingOperations.current.get(operationKey);
      }

      startFileContentLoading();
      try {
        const content = await getBlob(file.url);
        updateFileContent(content);
      } catch (error) {
        console.error('Error fetching file content:', error);
        throw error;
      } finally {
        stopFileContentLoading();
        pendingOperations.current.delete(operationKey);
      }
    },
    []
  );

  const handleFileSave = useCallback(
    async (content: string, fileName?: string) => {
      const fileToSave = fileName || (selectedFile?.pathname ?? '');
      if (!fileToSave) {
        throw new Error('No file name provided for save operation');
      }

      const operationKey = `save_${fileToSave}`;
      if (pendingOperations.current.has(operationKey)) {
        return pendingOperations.current.get(operationKey);
      }

      const isFolder = fileToSave.endsWith('/');
      const newFile: BlobFile = {
        pathname: fileToSave,
        size: isFolder ? 0 : content.length,
        uploadedAt: new Date().toISOString(),
        isDirectory: isFolder,
      };

      if (fileName) {
        updateSelectedFile(newFile);
        updateFiles((prevFiles) => [...prevFiles, newFile]);
      }

      const operation = putBlob(fileToSave, isFolder ? null : content)
        .then((result) => {
          const updatedFile = {
            ...newFile,
            url: result.url,
            downloadUrl: result.downloadUrl,
          };

          updateFiles((prevFiles) =>
            prevFiles.map((f) => (f.pathname === fileToSave ? updatedFile : f))
          );
          updateSelectedFile(updatedFile);

          if (!isFolder) {
            updateFileContent(content);
          }
          return updatedFile;
        })
        .catch((error) => {
          console.error('Error saving file:', error);
          throw error;
        })
        .finally(() => {
          pendingOperations.current.delete(operationKey);
        });

      pendingOperations.current.set(operationKey, operation);
      return operation;
    },
    [selectedFile, updateFiles, updateSelectedFile, updateFileContent]
  );

  const handleFileDelete = useCallback(
    async (file: BlobFile) => {
      if (!file.url) return;

      const operationKey = `delete_${file.pathname}`;
      if (pendingOperations.current.has(operationKey)) {
        return pendingOperations.current.get(operationKey);
      }

      pendingDeletions.current.add(file.pathname);
      updateFiles((prevFiles) => prevFiles.filter((f) => f.pathname !== file.pathname));

      if (selectedFile?.pathname === file.pathname) {
        updateSelectedFile(null);
        updateFileContent('');
      }

      const operation = deleteBlob(file.url)
        .catch((error) => {
          console.error('Error deleting file:', error);
          pendingDeletions.current.delete(file.pathname);
          return fetchFiles(); // Refresh the file list to restore the file if deletion failed
        })
        .finally(() => {
          pendingOperations.current.delete(operationKey);
        });

      pendingOperations.current.set(operationKey, operation);
      return operation;
    },
    [selectedFile, fetchFiles, updateFiles, updateSelectedFile, updateFileContent]
  );

  const handleFolderDelete = useCallback(
    async (folderPath: string) => {
      const filesToDelete = files.filter((file) => file.pathname.startsWith(folderPath));
      return Promise.all(filesToDelete.map((file) => handleFileDelete(file)));
    },
    [files, handleFileDelete]
  );

  return {
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
  };
}
