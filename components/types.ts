import { BlobFile } from '../app/actions'

export interface TreeDataItem {
  id: string
  name: string
  icon?: React.ComponentType<{ className?: string }>
  openIcon?: React.ComponentType<{ className?: string }>
  children?: TreeDataItem[]
  actions?: React.ReactNode
  onClick?: () => void
  uploadedAt?: string
}

export interface ItemToDelete {
  type: 'file' | 'folder'
  item: BlobFile | string
}

