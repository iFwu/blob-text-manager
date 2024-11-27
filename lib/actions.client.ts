/**
 * Client-side implementation of blob management actions.
 * THIS IS FOR TESTING PURPOSES ONLY!
 *
 * This implementation allows intercepting API calls in the browser during tests.
 * DO NOT USE IN PRODUCTION as it would expose your BLOB token.
 *
 * The BLOB token should only be exposed during local debugging if absolutely
 * necessary. In production, always use the server-side implementation.
 */

'use client';

import type {
  BlobFile,
  BlobFileResult,
  BlobFolderResult,
  BlobOperations,
  BlobResult,
} from '@/types';
import {
  createFolder,
  del,
  list,
  put,
  type ListBlobResultBlob,
} from '@vercel/blob';

const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

if (!token) {
  throw new Error('NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN is not set');
}

export const listBlobs: BlobOperations['listBlobs'] = async (): Promise<
  BlobFile[]
> => {
  const { blobs } = await list({ token });
  const fileMap = new Map<string, ListBlobResultBlob>();

  for (const blob of blobs) {
    const pathWithoutSuffix = blob.pathname.replace(
      /-[a-zA-Z0-9]{21}(\.[^.]+)?$/,
      '$1'
    );
    const existing = fileMap.get(pathWithoutSuffix);
    if (
      !existing ||
      new Date(blob.uploadedAt) > new Date(existing.uploadedAt)
    ) {
      fileMap.set(pathWithoutSuffix, blob);
    }
  }

  return Array.from(fileMap.values()).map((blob) => ({
    pathname: blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1'),
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    size: blob.size,
    uploadedAt: blob.uploadedAt.toISOString(),
    isDirectory: blob.pathname.endsWith('/') && blob.size === 0,
  }));
};

export const getBlob: BlobOperations['getBlob'] = async (
  url: string
): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch blob content');
  }
  return response.text();
};

export const putBlob: BlobOperations['putBlob'] = async (
  pathname: string,
  content?: string | File
): Promise<BlobResult> => {
  const { blobs } = await list({ token });
  const existingFiles = blobs.filter(
    (blob) =>
      blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === pathname
  );

  if (existingFiles.length > 0) {
    await del(
      existingFiles.map((file) => file.url),
      { token }
    );
  }

  const isFolder = pathname.endsWith('/');
  if (isFolder) {
    const result = await createFolder(pathname, { token });
    return {
      type: 'folder',
      url: result.url,
    } satisfies BlobFolderResult;
  }

  const result = await put(pathname, content ?? '', {
    access: 'public',
    addRandomSuffix: true,
    token,
  });

  return {
    type: 'file',
    url: result.url,
    downloadUrl: result.downloadUrl,
  } satisfies BlobFileResult;
};

export const deleteBlob: BlobOperations['deleteBlob'] = async (
  urls: string | string[]
) => {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  await del(urlArray, { token });
};
