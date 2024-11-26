import type { BlobOperations } from '@/types';

/**
 * This is the entry point for blob management actions.
 * It will use different implementations based on the environment:
 * - In test: Uses client-side implementation
 * - In production: Uses server-side implementation
 */

let actions: BlobOperations;

if (process.env.NEXT_PUBLIC_IS_TEST === 'true') {
  // 加载测试环境的 Client-side 模块
  actions = require('./actions.client');
} else {
  // 加载生产环境的 Server-side 模块
  actions = require('./actions.server');
}

export const { listBlobs, getBlob, putBlob, deleteBlob }: BlobOperations =
  actions;
