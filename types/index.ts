export interface TreeDataItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  openIcon?: React.ComponentType<{ className?: string }>;
  selectedIcon?: React.ComponentType<{ className?: string }>;
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
  pathname: string;
  url?: string;
  downloadUrl?: string;
  size: number;
  uploadedAt: string;
  isDirectory: boolean;
}

export type BlobFileResult = {
  type: 'file';
  url: string;
  downloadUrl: string;
};

export type BlobFolderResult = {
  type: 'folder';
  url: string;
};

export type BlobResult = BlobFileResult | BlobFolderResult;

export type ValidationResult = {
  isValid: boolean;
  error: string | null;
};
