import { useMemo } from 'react';
import { FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react';
import { BlobFile, TreeDataItem } from '@/types';
import { FileAction } from '@/components/ui/file-action';

export function useTreeData(
  files: BlobFile[],
  onFileSelect: (file: BlobFile | null) => void,
  onFileDelete: (file: BlobFile) => void,
  onFolderDelete: (folderPath: string) => void
) {
  // Memoize buildTreeData result to prevent unnecessary recalculations
  const treeData = useMemo(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('buildTreeData called with files:', files);
    }
    return buildTreeData(files, onFileSelect, onFileDelete, onFolderDelete);
  }, [files, onFileSelect, onFileDelete, onFolderDelete]); // Only rebuild when files or callbacks change

  return treeData;
}

function buildTreeData(
  files: BlobFile[],
  onFileSelect: (file: BlobFile | null) => void,
  onFileDelete: (file: BlobFile) => void,
  onFolderDelete: (folderPath: string) => void
): TreeDataItem[] {
  const directories = new Map<string, TreeDataItem>();
  const rootItems: TreeDataItem[] = [];

  // First pass: Create directory nodes
  files
    .filter((file) => file.isDirectory)
    .forEach((file) => {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Processing directory:', file);
      }
      const parts = file.pathname.split('/');
      let currentPath = '';
      let currentArray = rootItems;

      parts.forEach((part) => {
        if (part === '') return;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('  Processing path part:', part, 'currentPath:', currentPath);
        }

        if (!directories.has(currentPath)) {
          // 找到对应的目录文件
          const dirFile = files.find(
            (f) => f.isDirectory && f.pathname.replace(/\/$/, '') === currentPath
          );
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('  Found directory file:', dirFile);
          }
          
          const dirItem: TreeDataItem = {
            id: currentPath,
            name: part,
            icon: FolderIcon,
            openIcon: FolderOpenIcon,
            children: [],
            uploadedAt: dirFile?.uploadedAt || file.uploadedAt,
            actions: <FileAction onClick={() => onFolderDelete(currentPath)} />,
            onClick: () => {
              // Only log in development
              if (process.env.NODE_ENV === 'development') {
                console.log('Directory clicked:', dirFile || file);
              }
              onFileSelect(dirFile || file);
            },
          };
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('  Created directory item:', dirItem);
          }
          directories.set(currentPath, dirItem);
          currentArray.push(dirItem);
        }
        currentArray = directories.get(currentPath)!.children!;
      });
    });

  // Second pass: Add file nodes
  files
    .filter((file) => !file.isDirectory)
    .forEach((file) => {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Processing file:', file);
      }
      const parts = file.pathname.split('/');
      let currentPath = '';
      let currentArray = rootItems;

      // Navigate to the correct directory
      parts.slice(0, -1).forEach((part) => {
        if (part === '') return;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('  Navigating to directory:', currentPath);
        }
        currentArray = directories.get(currentPath)?.children || currentArray;
      });

      // Add file node
      const fileItem: TreeDataItem = {
        id: file.pathname,
        name: parts[parts.length - 1],
        icon: FileIcon,
        uploadedAt: file.uploadedAt,
        actions: <FileAction onClick={() => onFileDelete(file)} />,
        onClick: () => {
          // Only log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('File clicked:', file);
          }
          onFileSelect(file);
        },
      };
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('  Created file item:', fileItem);
      }
      currentArray.push(fileItem);
    });

  const result = sortTreeItems(rootItems);
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Final tree data:', result);
  }
  return result;
}

function sortTreeItems(items: TreeDataItem[]): TreeDataItem[] {
  const folders = items.filter((item) => item.children);
  const files = items.filter((item) => !item.children);

  const sortByDate = (a: TreeDataItem, b: TreeDataItem) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  };

  folders.sort(sortByDate);
  files.sort(sortByDate);

  const sortedItems = [...folders, ...files];
  sortedItems.forEach((item) => {
    if (item.children) {
      item.children = sortTreeItems(item.children);
    }
  });

  return sortedItems;
}
