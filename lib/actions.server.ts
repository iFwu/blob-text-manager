'use server';

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

export const listBlobs: BlobOperations['listBlobs'] = async (): Promise<
  BlobFile[]
> => {
  const startTime = Date.now();
  console.log(
    `[Server] List API request started at ${new Date(startTime).toISOString()}`
  );

  const { blobs } = await list();

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

  const processedBlobs = Array.from(fileMap.values()).map((blob) => ({
    pathname: blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1'),
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    size: blob.size,
    uploadedAt: blob.uploadedAt.toISOString(),
    isDirectory: blob.pathname.endsWith('/') && blob.size === 0,
  }));

  const endTime = Date.now();
  console.log(
    `[Server] List API completed at ${new Date(endTime).toISOString()} (${endTime - startTime}ms)`
  );
  return processedBlobs;
};

export const getBlob: BlobOperations['getBlob'] = async (
  url: string
): Promise<string> => {
  const startTime = Date.now();
  console.log(
    `[Server] Get blob request started at ${new Date(startTime).toISOString()}`
  );

  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `[Server] Blob fetch failed at ${new Date().toISOString()}: ${response.status}`
    );
    throw new Error('Failed to fetch blob content');
  }

  const content = await response.text();
  const endTime = Date.now();
  console.log(
    `[Server] Get blob completed at ${new Date(endTime).toISOString()} (${endTime - startTime}ms)`
  );
  return content;
};

export const putBlob: BlobOperations['putBlob'] = async (
  pathname: string,
  content?: string | File
): Promise<BlobResult> => {
  const startTime = Date.now();
  console.log(
    `[Server] Put operation started at ${new Date(startTime).toISOString()}`
  );

  const { blobs } = await list();
  const existingFiles = blobs.filter(
    (blob) =>
      blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === pathname
  );

  if (existingFiles.length > 0) {
    const deleteStart = Date.now();
    console.log(
      `[Server] Deleting old versions started at ${new Date(deleteStart).toISOString()}`
    );
    await del(existingFiles.map((file) => file.url));
    console.log(`[Server] Delete completed at ${new Date().toISOString()}`);
  }

  const isFolder = pathname.endsWith('/');
  if (isFolder) {
    const folderStart = Date.now();
    console.log(
      `[Server] Folder creation started at ${new Date(folderStart).toISOString()}`
    );
    const result = await createFolder(pathname);
    const folderEnd = Date.now();
    console.log(
      `[Server] Folder creation completed at ${new Date(folderEnd).toISOString()} (${folderEnd - folderStart}ms)`
    );
    return {
      type: 'folder',
      url: result.url,
    } satisfies BlobFolderResult;
  }

  const putStart = Date.now();
  console.log(
    `[Server] Put request started at ${new Date(putStart).toISOString()}`
  );

  const result = await put(pathname, content ?? '', {
    access: 'public',
    addRandomSuffix: true,
  });

  const endTime = Date.now();
  console.log(
    `[Server] Put operation completed at ${new Date(endTime).toISOString()} (${endTime - startTime}ms)`
  );

  return {
    type: 'file',
    url: result.url,
    downloadUrl: result.downloadUrl,
  } satisfies BlobFileResult;
};

export const deleteBlob: BlobOperations['deleteBlob'] = async (
  urls: string | string[]
) => {
  const startTime = Date.now();
  console.log(
    `[Server] Delete request started at ${new Date(startTime).toISOString()}`
  );

  const urlArray = Array.isArray(urls) ? urls : [urls];
  await del(urlArray);

  const endTime = Date.now();
  console.log(
    `[Server] Delete completed at ${new Date(endTime).toISOString()} ` +
      `(${endTime - startTime}ms)`
  );
};
