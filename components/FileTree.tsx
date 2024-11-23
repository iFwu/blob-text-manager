'use client';

import { useState, useMemo, useCallback } from 'react';
import { FileIcon, FolderIcon } from 'lucide-react';
import TreeView from './ui/tree-view';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { BlobFile, ItemToDelete, TreeDataItem } from '../types';
import { useTreeData } from '@/hooks/useTreeData';
import { useTreeExpansion } from '@/hooks/useTreeExpansion';

interface FileTreeProps {
  files: BlobFile[];
  onFileSelect: (file: BlobFile | null) => void;
  onFileDelete: (file: BlobFile) => void;
  onFolderDelete: (folderPath: string) => void;
  isLoading: boolean;
  selectedFile: BlobFile | null;
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
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleFileDelete = (file: BlobFile) => {
    setItemToDelete({ type: 'file', item: file });
    setIsDeleteDialogOpen(true);
  };

  const handleFolderDelete = (folderPath: string) => {
    setItemToDelete({ type: 'folder', item: folderPath });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'file') {
        onFileDelete(itemToDelete.item as BlobFile);
      } else {
        onFolderDelete(itemToDelete.item as string);
      }
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const treeData = useTreeData(files, onFileSelect, handleFileDelete, handleFolderDelete);

  const {
    expandedItems,
    isParentOfSelected,
    expandToItem,
    toggleExpand,
  } = useTreeExpansion(selectedFile?.pathname);

  const selectedItemId = useMemo(() => {
    return selectedFile?.pathname;
  }, [selectedFile]);

  const handleItemClick = useCallback((item: TreeDataItem) => {
    item.onClick?.();
    if (item.children) {
      expandToItem(item.id);
    }
  }, [expandToItem]);

  if (process.env.NODE_ENV === 'development') {
    console.log('Rendering FileTree with:', {
      selectedItemId,
      expandedItems,
      treeData,
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Files</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <TreeView
          data={treeData}
          selectedItemId={selectedItemId}
          expandedItems={expandedItems}
          hoveredItemId={hoveredItemId}
          defaultNodeIcon={FolderIcon}
          defaultLeafIcon={FileIcon}
          onItemClick={handleItemClick}
          onItemHover={setHoveredItemId}
          onToggleExpand={toggleExpand}
          isParentOfSelected={isParentOfSelected}
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
