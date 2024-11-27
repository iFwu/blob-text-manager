import type { BlobStorageMock } from './blobStorageMock';

declare global {
  const blobStorageMock: BlobStorageMock;
}
