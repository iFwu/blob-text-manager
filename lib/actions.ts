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

// 默认超时时间（毫秒）
const DEFAULT_TIMEOUT = 10 * 1000;

// 超时错误类
class TimeoutError extends Error {
  constructor(operation: string) {
    super(`Operation ${operation} timed out after ${DEFAULT_TIMEOUT}ms`);
    this.name = 'TimeoutError';
  }
}

// 超时处理包装函数
async function withTimeout<T, Args extends unknown[]>(
  operation: string,
  fn: (...args: Args) => Promise<T>,
  ...args: Args
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(operation));
    }, DEFAULT_TIMEOUT);
  });

  return Promise.race([fn(...args), timeoutPromise]);
}

const {
  listBlobs: originalListBlobs,
  getBlob: originalGetBlob,
  putBlob: originalPutBlob,
  deleteBlob: originalDeleteBlob,
} = actions;

// 包装后的函数
export const listBlobs: BlobOperations['listBlobs'] = (...args) =>
  withTimeout('listBlobs', originalListBlobs, ...args);

export const getBlob: BlobOperations['getBlob'] = (...args) =>
  withTimeout('getBlob', originalGetBlob, ...args);

export const putBlob: BlobOperations['putBlob'] = (...args) =>
  withTimeout('putBlob', originalPutBlob, ...args);

export const deleteBlob: BlobOperations['deleteBlob'] = (...args) =>
  withTimeout('deleteBlob', originalDeleteBlob, ...args);
