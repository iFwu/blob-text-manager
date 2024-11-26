import { useState, useCallback, useMemo } from 'react';
import { listBlobs, getBlob, putBlob, deleteBlob } from '@/lib/actions';
import { BlobFile, ValidationResult } from '@/types';

export function useFileOperations() {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<BlobFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isFileTreeLoading, setIsFileTreeLoading] = useState<boolean>(false);
  const [isFileContentLoading, setIsFileContentLoading] =
    useState<boolean>(false);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const memoizedFiles = useMemo(() => files, [files]);

  const fetchFiles = useCallback(async () => {
    setIsFileTreeLoading(true);
    try {
      const blobList = await listBlobs();
      setFiles(blobList);
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

  const validateFileName = useCallback(
    (name: string, isDirectory: boolean): ValidationResult => {
      if (!name) {
        return { isValid: false, error: 'Please enter a name' };
      }

      if (/[<>:"|?*\\]/.test(name)) {
        return { isValid: false, error: 'Name contains invalid characters' };
      }

      const parts = name.split('/').filter(Boolean);
      if (parts.some((part) => part === '.' || part === '..')) {
        return {
          isValid: false,
          error: 'Invalid path: cannot contain . or ..',
        };
      }

      const baseName = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      const fullPath = name + (isDirectory ? '/' : '');

      const conflictingFile = files.find((f) => {
        const fParts = f.pathname.replace(/\/$/, '').split('/');
        const fName = fParts[fParts.length - 1];
        const fParent = fParts.slice(0, -1).join('/');

        return fName === baseName && fParent === parentPath;
      });

      if (conflictingFile) {
        return {
          isValid: false,
          error: 'File or folder already exists',
        };
      }

      if (parts.length > 1) {
        const parentDirPath = parts.slice(0, -1).join('/') + '/';
        const parentExists = files.some(
          (f) => f.isDirectory && f.pathname === parentDirPath
        );
        if (!parentExists) {
          return { isValid: false, error: 'Parent directory does not exist' };
        }
      }

      return { isValid: true, error: null };
    },
    [files]
  );

  const handleFileSave = useCallback(
    async (content: string, fileName?: string) => {
      try {
        const fileToSave = fileName || (selectedFile?.pathname ?? '');
        if (!fileToSave) {
          throw new Error('No file name provided for save operation');
        }

        const isFolder = fileToSave.endsWith('/');
        const validation = validateFileName(fileToSave, isFolder);

        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid file name');
        }

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
          ...(result.type === 'file'
            ? { downloadUrl: result.downloadUrl }
            : {}),
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
        throw error; // 让调用者处理错误
      }
    },
    [selectedFile, validateFileName]
  );

  const handleFileDelete = useCallback(
    async (file: BlobFile) => {
      if (!file.url) return;

      // 如果是文件夹，获取所有相关文件
      const filesToDelete = file.isDirectory
        ? files.filter((f) => f.pathname.startsWith(file.pathname))
        : [file];

      // 更新 UI 状态
      setFiles((prevFiles) =>
        prevFiles.filter(
          (f) => !filesToDelete.some((fd) => fd.pathname === f.pathname)
        )
      );

      // 如果当前选中的文件在要删除的列表中，清除选择
      if (
        selectedFile &&
        filesToDelete.some((f) => selectedFile.pathname.startsWith(f.pathname))
      ) {
        setSelectedFile(null);
        setFileContent('');
      }

      try {
        // 添加正在删除的文件到状态
        setDeletingFiles((prev) => {
          const newSet = new Set(prev);
          filesToDelete.forEach((f) => newSet.add(f.pathname));
          return newSet;
        });

        // 将多个单独的删除请求合并成一个批量删除
        const urlsToDelete = filesToDelete
          .filter((f) => f.url)
          .map((f) => f.url!);

        if (urlsToDelete.length > 0) {
          await deleteBlob(urlsToDelete);
        }
      } finally {
        // 删除完成后移除loading状态
        setDeletingFiles((prev) => {
          const newSet = new Set(prev);
          filesToDelete.forEach((f) => newSet.delete(f.pathname));
          return newSet;
        });
      }
    },
    [files, selectedFile]
  );

  return {
    files: memoizedFiles,
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
  };
}
