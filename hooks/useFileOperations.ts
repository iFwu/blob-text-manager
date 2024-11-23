import { useState, useCallback, useMemo, useRef } from 'react';
import { listBlobs, getBlob, putBlob, deleteBlob } from '../app/actions';
import { BlobFile } from '../types';

export function useFileOperations() {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<BlobFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isFileTreeLoading, setIsFileTreeLoading] = useState<boolean>(false);
  const [isFileContentLoading, setIsFileContentLoading] = useState<boolean>(false);
  const pendingDeletions = useRef(new Set<string>());

  const memoizedFiles = useMemo(() => files, [files]);

  const fetchFiles = useCallback(async () => {
    setIsFileTreeLoading(true);
    try {
      const blobList = await listBlobs();
      setFiles(blobList.filter((file) => !pendingDeletions.current.has(file.pathname)));
    } catch (error) {
      console.error('Error fetching file list:', error);
    } finally {
      setIsFileTreeLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (file: BlobFile | null) => {
    setSelectedFile(file);
    if (file?.isDirectory) {
      setFileContent('');
      return;
    }
    setFileContent('');
    if (!file || !file.url) return;

    setIsFileContentLoading(true);
    try {
      const content = await getBlob(file.url);
      setFileContent(content);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('Error loading file content');
    } finally {
      setIsFileContentLoading(false);
    }
  }, []);

  const handleFileSave = useCallback(
    async (content: string, fileName?: string) => {
      try {
        const fileToSave = fileName || (selectedFile?.pathname ?? '');
        if (!fileToSave) {
          console.error('No file name provided for save operation');
          return;
        }

        const isFolder = fileToSave.endsWith('/');

        const newFile: BlobFile = {
          pathname: fileToSave,
          size: isFolder ? 0 : content.length,
          uploadedAt: new Date().toISOString(),
          isDirectory: isFolder,
        };

        // 立即更新 selectedFile，不等待保存完成
        if (fileName) {
          setSelectedFile(newFile);
          setFiles((prevFiles) => [...prevFiles, newFile]);
        }

        const result = await putBlob(fileToSave, isFolder ? null : content);

        // 更新文件的实际 URL
        const updatedFile = {
          ...newFile,
          url: result.url,
          downloadUrl: result.downloadUrl,
        };

        if (fileName) {
          setFiles((prevFiles) =>
            prevFiles.map((f) => (f.pathname === fileToSave ? updatedFile : f))
          );
          setSelectedFile(updatedFile);
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) => (f.pathname === fileToSave ? updatedFile : f))
          );
          setSelectedFile(updatedFile);
        }

        if (!isFolder) {
          setFileContent(content);
        }
      } catch (error) {
        console.error('Error saving file:', error);
      }
    },
    [selectedFile]
  );

  const handleFileDelete = useCallback(
    async (file: BlobFile) => {
      if (!file.url) return;

      pendingDeletions.current.add(file.pathname);
      setFiles((prevFiles) => prevFiles.filter((f) => f.pathname !== file.pathname));

      if (selectedFile?.pathname === file.pathname) {
        setSelectedFile(null);
        setFileContent('');
      }

      try {
        await deleteBlob(file.url);
      } catch (error) {
        console.error('Error deleting file:', error);
        pendingDeletions.current.delete(file.pathname);
        await fetchFiles(); // Refresh the file list to restore the file if deletion failed
      }
    },
    [selectedFile, fetchFiles]
  );

  const handleFolderDelete = useCallback(
    async (folderPath: string) => {
      const filesToDelete = files.filter((file) => file.pathname.startsWith(folderPath));

      for (const file of filesToDelete) {
        await handleFileDelete(file);
      }

      setFiles((prevFiles) => prevFiles.filter((file) => !file.pathname.startsWith(folderPath)));
    },
    [files, handleFileDelete]
  );

  return {
    files: memoizedFiles,
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
