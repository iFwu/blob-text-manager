'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileIcon, FolderIcon, FolderOpenIcon, TrashIcon } from 'lucide-react';
import { TreeView } from './ui/tree-view';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { BlobFile, ItemToDelete, TreeDataItem } from '@/types';
import { useFileTree } from '@/hooks/useFileTree';

interface FileExplorerProps {
  files: BlobFile[];
  onFileSelect: (file: BlobFile | null) => void;
  onFileDelete: (file: BlobFile) => void;
  onFolderDelete: (folderPath: string) => void;
  onAddDirectory: (directoryPath: string) => void;
  isLoading: boolean;
  selectedFile: BlobFile | null;
}

export default function FileExplorer({
  files,
  onFileSelect,
  onFileDelete,
  onFolderDelete,
  onAddDirectory,
  isLoading,
  selectedFile,
}: FileExplorerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemToDelete | null>(null);
  const [shouldClearSelection, setShouldClearSelection] = useState(false);

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

  const { treeData } = useFileTree({
    files,
    handleDeleteClick,
    handleFolderDeleteClick,
    onFileSelect: (file) => {
      onFileSelect(file);
      setShouldClearSelection(false);
    },
    onAddDirectory: (directoryPath) => {
      onAddDirectory(directoryPath);
      setShouldClearSelection(true);
    },
  });

  const handleSelectChange = useCallback(
    (item: TreeDataItem | undefined) => {
      if (!item) {
        onFileSelect(null);
        return;
      }

      const normalizedId = item.id.replace(/\/+$/, '');
      const selectedFile = files.find((file) => file.pathname.replace(/\/+$/, '') === normalizedId);
      onFileSelect(selectedFile || null);
    },
    [files, onFileSelect]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Files</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <TreeView
          data={treeData}
          selectedItemId={shouldClearSelection ? null : selectedFile?.pathname ?? null}
          onSelectChange={handleSelectChange}
          defaultNodeIcon={FolderIcon}
          defaultLeafIcon={FileIcon}
          className="group"
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
