'use client';

import { useState, useCallback } from 'react';
import { FileIcon, FolderIcon, FolderOpenIcon, TrashIcon } from 'lucide-react';
import { BlobFile } from '../types';
import { FileTreeView } from './FileTreeView';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ItemToDelete, TreeDataItem } from '../types';
import { Button } from '@/components/ui/button';

interface FileTreeProps {
  files: BlobFile[];
  onFileSelect: (file: BlobFile) => void;
  onFileDelete: (file: BlobFile) => void;
  onFolderDelete: (folderPath: string) => void;
  isLoading: boolean;
  selectedFile: BlobFile | null;
}

function sortItems(items: TreeDataItem[]): TreeDataItem[] {
  const folders = items.filter((item) => item.children);
  const files = items.filter((item) => !item.children);

  const sortByDate = (a: TreeDataItem, b: TreeDataItem) => {
    const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
    const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
    return bTime - aTime;
  };

  folders.sort(sortByDate);
  files.sort(sortByDate);

  return [...folders, ...files];
}

export default function FileTree({
  files,
  onFileSelect,
  onFileDelete,
  onFolderDelete,
  isLoading,
  selectedFile,
}: FileTreeProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);

  const handleDeleteClick = useCallback((file: BlobFile) => {
    setItemToDelete({ type: 'file', item: file });
    setIsDeleteDialogOpen(true);
  }, []);

  const handleFolderDeleteClick = useCallback((folderPath: string) => {
    setItemToDelete({ type: 'folder', item: folderPath });
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) {
      if (itemToDelete.type === 'file') {
        onFileDelete(itemToDelete.item as BlobFile);
      } else {
        onFolderDelete(itemToDelete.item as string);
      }
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, onFileDelete, onFolderDelete]);

  const buildTreeData = useCallback(
    (files: BlobFile[]): TreeDataItem[] => {
      const directories = new Map<string, TreeDataItem>();
      const rootItems: TreeDataItem[] = [];

      files.forEach((file) => {
        const parts = file.name.split('/');
        let currentPath = '';
        let currentArray = rootItems;

        parts.forEach((part, index) => {
          if (part === '') return;

          currentPath = currentPath ? `${currentPath}/${part}` : part;
          const isLastPart = index === parts.length - 1;
          const isDirectory = !isLastPart || file.isDirectory;

          if (isDirectory) {
            if (!directories.has(currentPath)) {
              const dirItem: TreeDataItem = {
                id: currentPath,
                name: part,
                icon: FolderIcon,
                openIcon: FolderOpenIcon,
                children: [],
                uploadedAt: file.uploadedAt,
                actions: (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderDeleteClick(currentPath);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                ),
              };
              directories.set(currentPath, dirItem);
              currentArray.push(dirItem);
            }
            currentArray = directories.get(currentPath)!.children!;
          } else {
            const fileItem: TreeDataItem = {
              id: file.name,
              name: part,
              icon: FileIcon,
              uploadedAt: file.uploadedAt,
              actions: (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(file);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              ),
              onClick: () => onFileSelect(file),
            };
            currentArray.push(fileItem);
          }
        });
      });

      const sortRecursively = (items: TreeDataItem[]) => {
        const sortedItems = sortItems(items);
        sortedItems.forEach((item) => {
          if (item.children) {
            item.children = sortRecursively(item.children);
          }
        });
        return sortedItems;
      };

      return sortRecursively(rootItems);
    },
    [handleDeleteClick, handleFolderDeleteClick, onFileSelect]
  );

  const treeData = buildTreeData(files);

  const handleSelectChange = useCallback(
    (item: TreeDataItem | undefined) => {
      if (!item) return;
      const file = files.find((f) => f.name === item.id);
      if (file && !file.isDirectory) {
        onFileSelect(file);
      }
    },
    [files, onFileSelect]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Files</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <FileTreeView
          treeData={treeData}
          selectedFile={selectedFile ? selectedFile.name : undefined}
          onSelectChange={handleSelectChange}
        />
      )}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemType={itemToDelete?.type || null}
      />
    </div>
  );
}
