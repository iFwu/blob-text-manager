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
      setFiles(blobList.filter((file) => !pendingDeletions.current.has(file.name)));
    } catch (error) {
      console.error('Error fetching file list:', error);
    } finally {
      setIsFileTreeLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (file: BlobFile) => {
    if (file.isDirectory) return;
    setSelectedFile(file);
    setFileContent('');
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
        const fileToSave = fileName || (selectedFile?.name ?? '');
        if (!fileToSave) {
          console.error('No file name provided for save operation');
          return;
        }

        const isFolder = fileToSave.endsWith('/');

        const newFile: BlobFile = {
          name: fileToSave,
          url: fileToSave,  // 使用文件名作为临时 URL
          downloadUrl: '',
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
          setFiles((prevFiles) => prevFiles.map((f) => (f.name === fileToSave ? updatedFile : f)));
          setSelectedFile(updatedFile);
        } else {
          setFiles((prevFiles) => prevFiles.map((f) => (f.name === fileToSave ? updatedFile : f)));
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
      if (pendingDeletions.current.has(file.name)) {
        return;
      }

      pendingDeletions.current.add(file.name);

      setFiles((prevFiles) =>
        prevFiles.filter((f) => f.name !== file.name && !pendingDeletions.current.has(f.name))
      );
      if (selectedFile && selectedFile.name === file.name) {
        setSelectedFile(null);
        setFileContent('');
      }

      try {
        await deleteBlob(file.url);
      } catch (error) {
        console.error('Error deleting file:', error);
        setFiles((prevFiles) => [...prevFiles, file]);
      } finally {
        pendingDeletions.current.delete(file.name);
      }
    },
    [selectedFile]
  );

  const handleFolderDelete = useCallback(
    async (folderPath: string) => {
      const filesToDelete = files.filter((file) => file.name.startsWith(folderPath));

      for (const file of filesToDelete) {
        await handleFileDelete(file);
      }

      setFiles((prevFiles) => prevFiles.filter((file) => !file.name.startsWith(folderPath)));
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
