export interface TreeDataItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  openIcon?: React.ComponentType<{ className?: string }>;
  children?: TreeDataItem[];
  actions?: React.ReactNode;
  onClick?: () => void;
  uploadedAt?: string;
}

export interface ItemToDelete {
  type: 'file' | 'folder';
  item: BlobFile | string;
}

export interface BlobFile {
  name: string;
  url: string;
  downloadUrl: string;
  size: number;
  uploadedAt: string;
  isDirectory: boolean;
}
