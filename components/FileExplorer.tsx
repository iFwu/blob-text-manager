'use client';

import { useState, useCallback } from 'react';
import { TreeView } from './ui/tree-view';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { BlobFile, TreeDataItem } from '@/types';
import { useFileTree } from '@/hooks/useFileTree';
import { DirectoryAction, FileAction } from './ui/tree-actions';
import { FileIcon, FolderIcon } from 'lucide-react';

interface FileExplorerProps {
  files: BlobFile[];
  onFileSelect: (file: BlobFile | null) => void;
  onFileDelete: (file: BlobFile) => void;
  onSetCreateTarget: (directoryPath: string) => void;
  isLoading: boolean;
  selectedFile: BlobFile | null;
}

export default function FileExplorer({
  files,
  onFileSelect,
  onFileDelete,
  onSetCreateTarget,
  isLoading,
  selectedFile,
}: FileExplorerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BlobFile | null>(null);

  const handleDeleteClick = useCallback((file: BlobFile) => {
    setItemToDelete(file);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) {
      onFileDelete(itemToDelete);
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  }, [itemToDelete, onFileDelete]);

  const { treeData } = useFileTree({
    files,
    handleDeleteClick,
    onFileSelect,
    onSetCreateTarget,
    renderFileActions: (file) => (
      <div className="flex items-center">
        <FileAction onDelete={() => handleDeleteClick(file)} />
      </div>
    ),
    renderDirectoryActions: (path) => {
      const dirFile = files.find((f) => f.pathname === path + '/');
      return (
        <div className="flex items-center">
          <DirectoryAction
            onDelete={() => dirFile && handleDeleteClick(dirFile)}
            onAdd={() => onSetCreateTarget(path)}
            onFileSelect={onFileSelect}
          />
        </div>
      );
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
    <div className="h-full">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <TreeView
          data={treeData}
          selectedItemId={selectedFile?.pathname ?? null}
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
        itemType={itemToDelete ? (itemToDelete.isDirectory ? 'folder' : 'file') : null}
      />
    </div>
  );
}
