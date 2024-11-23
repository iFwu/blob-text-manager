import { useState, useMemo } from 'react';
import { BlobFile } from '../types';

export function useFileState() {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<BlobFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  
  const memoizedFiles = useMemo(() => files, [files]);

  const updateFiles = (updater: BlobFile[] | ((prev: BlobFile[]) => BlobFile[])) => {
    if (typeof updater === 'function') {
      setFiles(updater);
    } else {
      setFiles(updater);
    }
  };

  const updateSelectedFile = (file: BlobFile | null) => {
    setSelectedFile(file);
  };

  const updateFileContent = (content: string) => {
    setFileContent(content);
  };

  return {
    files: memoizedFiles,
    selectedFile,
    fileContent,
    updateFiles,
    updateSelectedFile,
    updateFileContent,
  };
}
