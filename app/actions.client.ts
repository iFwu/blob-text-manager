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

import { list, put, del, createFolder } from '@vercel/blob';
import type {
  BlobFile,
  BlobResult,
  BlobFileResult,
  BlobFolderResult,
  BlobOperations,
} from '../types';

const ZERO_WIDTH_SPACE = '\u200B';
const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

function handleEmptyContent(
  content: string | File | null,
  pathname: string
): string | File {
  if (typeof content === 'string') {
    return content.trim() === ''
      ? ZERO_WIDTH_SPACE
      : content.replace(/^\u200B/, '');
  } else if (content instanceof File && content.size === 0) {
    return new File([ZERO_WIDTH_SPACE], pathname, { type: content.type });
  }
  if (!content) {
    return new File([ZERO_WIDTH_SPACE], pathname, { type: 'text/plain' });
  }
  return content;
}

export async function listBlobs(): Promise<BlobFile[]> {
  const { blobs } = await list({ token });
  const fileMap = new Map<string, any>();

  blobs.forEach((blob) => {
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
  });

  return Array.from(fileMap.values()).map((blob) => ({
    pathname: blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1'),
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
    isDirectory: blob.pathname.endsWith('/') && blob.size === 0,
  }));
}

export async function getBlob(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch blob content');
  }
  return response.text();
}

export async function putBlob(
  pathname: string,
  content: string | File | null
): Promise<BlobResult> {
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

  content = handleEmptyContent(content, pathname);

  const result = await put(pathname, content, {
    access: 'public',
    addRandomSuffix: true,
    token,
  });

  return {
    type: 'file',
    url: result.url,
    downloadUrl: result.downloadUrl,
  } satisfies BlobFileResult;
}

export async function deleteBlob(urls: string | string[]) {
  const urlArray = Array.isArray(urls) ? urls : [urls];
  await del(urlArray, { token });
}
