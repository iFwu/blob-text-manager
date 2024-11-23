import { useState, useCallback } from 'react';

export function useLoading() {
  const [isFileTreeLoading, setIsFileTreeLoading] = useState(false);
  const [isFileContentLoading, setIsFileContentLoading] = useState(false);

  const startFileTreeLoading = useCallback(() => setIsFileTreeLoading(true), []);
  const stopFileTreeLoading = useCallback(() => setIsFileTreeLoading(false), []);
  const startFileContentLoading = useCallback(() => setIsFileContentLoading(true), []);
  const stopFileContentLoading = useCallback(() => setIsFileContentLoading(false), []);

  return {
    isFileTreeLoading,
    isFileContentLoading,
    startFileTreeLoading,
    stopFileTreeLoading,
    startFileContentLoading,
    stopFileContentLoading,
  };
}
