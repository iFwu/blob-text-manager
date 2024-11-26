import { useState, useCallback, useMemo } from 'react';
import { listBlobs, getBlob, putBlob, deleteBlob } from '@/lib/actions';
import type {
  BlobFile,
  ValidationResult,
  SaveFileParams,
  ValidateFileNameParams,
} from '@/types';

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
    ({ pathname, isEditing }: ValidateFileNameParams): ValidationResult => {
      if (!pathname) {
        return { isValid: false, error: 'Please enter a name' };
      }

      if (/[<>:"|?*\\]/.test(pathname)) {
        return { isValid: false, error: 'Name contains invalid characters' };
      }

      const parts = pathname.split('/').filter(Boolean);
      if (parts.some((part) => part === '.' || part === '..')) {
        return {
          isValid: false,
          error: 'Invalid path: cannot contain . or ..',
        };
      }

      const baseName = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');

      // 如果是编辑模式，跳过冲突检查
      if (!isEditing) {
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
      }
      return { isValid: true, error: null };
    },
    [files]
  );

  const handleFileSave = useCallback(
    async ({ content, pathname, isEditing }: SaveFileParams) => {
      const isFolder = pathname.endsWith('/');
      const validation = validateFileName({ pathname, isEditing });

      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file name');
      }

      const newFile: BlobFile = {
        pathname: pathname,
        size: isFolder ? 0 : content.length,
        uploadedAt: new Date().toISOString(),
        isDirectory: isFolder,
      };

      // 保存旧状态用于回滚
      const previousState = {
        files: [...files],
        selectedFile,
        fileContent,
      };
      if (!isEditing) {
        setFiles((prevFiles) => [...prevFiles, newFile]);
        setSelectedFile(newFile);
      }
      if (!isFolder) {
        setFileContent(content);
      }

      try {
        const result = await putBlob(pathname, content);
        // 更新文件的实际 URL
        const updatedFile = {
          ...newFile,
          url: result.url,
          ...(result.type === 'file'
            ? { downloadUrl: result.downloadUrl }
            : {}),
        };

        if (!isFolder) {
          setFiles((prevFiles) => {
            // 如果是编辑模式，更新已存在的文件
            if (isEditing) {
              return prevFiles.map((file) => {
                if (file.pathname === pathname) {
                  return updatedFile;
                }
                return file;
              });
            }

            // 如果是新建模式，替换临时文件为带 URL 的新文件
            return prevFiles.map((file) => {
              if (file === newFile) {
                return updatedFile;
              }
              return file;
            });
          });
          setSelectedFile(updatedFile);
        }
      } catch (error) {
        setFiles(previousState.files);
        setSelectedFile(previousState.selectedFile);
        setFileContent(previousState.fileContent);
        throw error;
      }
    },
    [files, selectedFile, fileContent, validateFileName]
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

  const handleDeleteAll = useCallback(async () => {
    if (files.length === 0) return;

    // 更新 UI 状态
    const previousFiles = [...files];
    setFiles([]);
    setSelectedFile(null);
    setFileContent('');

    try {
      // 添加所有文件到删除状态
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        files.forEach((f) => newSet.add(f.pathname));
        return newSet;
      });

      // 收集所有需要删除的文件 URL
      const urlsToDelete = files.filter((f) => f.url).map((f) => f.url!);

      if (urlsToDelete.length > 0) {
        await deleteBlob(urlsToDelete);
      }
    } catch (error) {
      // 如果删除失败，恢复之前的状态
      setFiles(previousFiles);
      throw error;
    } finally {
      // 删除完成后移除 loading 状态
      setDeletingFiles(new Set());
    }
  }, [files]);

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
    handleDeleteAll,
    validateFileName,
  };
}
