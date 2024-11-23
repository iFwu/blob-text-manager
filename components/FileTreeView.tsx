import { TreeView } from './ui/tree-view';
import { FileIcon, FolderIcon } from 'lucide-react';
import { TreeDataItem, BlobFile, ItemToDelete } from '../types';
import { useTreeData } from '@/hooks/useTreeData';
import { useTreeExpansion } from '@/hooks/useTreeExpansion';
import { useState } from 'react';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface FileTreeViewProps {
  files: BlobFile[];
  selectedFile?: BlobFile | null;
  onFileSelect: (file: BlobFile | null) => void;
  onFileDelete: (file: BlobFile) => void;
  onFolderDelete: (folderPath: string) => void;
}

export function FileTreeView({
  files,
  selectedFile,
  onFileSelect,
  onFileDelete,
  onFolderDelete,
}: FileTreeViewProps) {
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
  
  const { treeData } = useTreeData(files || [], onFileSelect, handleFileDelete, handleFolderDelete);
  
  const {
    expandedItems,
    isParentOfSelected,
    expandToItem,
    toggleExpand,
  } = useTreeExpansion(selectedFile?.pathname);

  const handleItemClick = (item: TreeDataItem) => {
    item.onClick?.();
    if (item.children) {
      expandToItem(item.id);
    }
  };

  return (
    <>
      <TreeView
        data={treeData}
        selectedItemId={selectedFile?.pathname}
        expandedItems={expandedItems}
        hoveredItemId={hoveredItemId}
        defaultNodeIcon={FolderIcon}
        defaultLeafIcon={FileIcon}
        onItemClick={handleItemClick}
        onItemHover={setHoveredItemId}
        onToggleExpand={toggleExpand}
        isParentOfSelected={isParentOfSelected}
      />
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemType={itemToDelete?.type || null}
      />
    </>
  );
}
