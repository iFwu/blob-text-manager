import type { BlobOperations } from '../types';

/**
 * This is the entry point for blob management actions.
 * It will use different implementations based on the environment:
 * - In test: Uses client-side implementation
 * - In production: Uses server-side implementation
 */

const isTest = process.env.NEXT_PUBLIC_IS_TEST === 'true';

// Dynamic import the appropriate implementation
const actions: BlobOperations = isTest
  ? await import('./actions.client')
  : await import('./actions.server');

export const { listBlobs, getBlob, putBlob, deleteBlob }: BlobOperations =
  actions;
