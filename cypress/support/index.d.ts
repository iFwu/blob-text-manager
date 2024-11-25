import { BlobStorageMock } from './blobStorageMock';

declare global {
  const blobStorageMock: BlobStorageMock;
}
