import { TreeView } from './tree-view';
import { FileIcon, FolderIcon } from 'lucide-react';
import { TreeDataItem } from '../types';

interface FileTreeViewProps {
  treeData: TreeDataItem[];
  selectedFile: string | undefined;
  onSelectChange: (item: TreeDataItem | undefined) => void;
}

export function FileTreeView({ treeData, selectedFile, onSelectChange }: FileTreeViewProps) {
  const normalizedSelectedFile = selectedFile?.replace(/\/+$/, '');

  return (
    <TreeView
      data={treeData}
      selectedItemId={normalizedSelectedFile}
      onSelectChange={onSelectChange}
      defaultNodeIcon={FolderIcon}
      defaultLeafIcon={FileIcon}
      className="group"
    />
  );
}
