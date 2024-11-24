'use server';

import { list, put, del, createFolder } from '@vercel/blob';
import { BlobFile, BlobResult, BlobFileResult, BlobFolderResult } from '../types';

const ZERO_WIDTH_SPACE = '\u200B';

function handleEmptyContent(content: string | File | null, pathname: string): string | File {
  if (typeof content === 'string') {
    return content.trim() === '' ? ZERO_WIDTH_SPACE : content.replace(/^\u200B/, '');
  } else if (content instanceof File && content.size === 0) {
    return new File([ZERO_WIDTH_SPACE], pathname, { type: content.type });
  }
  if (!content) {
    return new File([ZERO_WIDTH_SPACE], pathname, { type: 'text/plain' });
  }
  return content;
}

export async function listBlobs(): Promise<BlobFile[]> {
  console.log('Calling list API...');
  const { blobs } = await list();
  console.log('List API Response:', JSON.stringify(blobs, null, 2));

  const fileMap = new Map<string, any>();

  blobs.forEach((blob) => {
    const pathWithoutSuffix = blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1');
    const existing = fileMap.get(pathWithoutSuffix);
    if (!existing || new Date(blob.uploadedAt) > new Date(existing.uploadedAt)) {
      fileMap.set(pathWithoutSuffix, blob);
    }
  });

  const processedBlobs = Array.from(fileMap.values()).map((blob) => ({
    pathname: blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1'),
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
    isDirectory: blob.pathname.endsWith('/') && blob.size === 0,
  }));

  return processedBlobs;
}

export async function getBlob(url: string): Promise<string> {
  console.log('Fetching blob content from URL:', url);
  const response = await fetch(url);
  if (!response.ok) {
    console.error('Failed to fetch blob content:', response.status, response.statusText);
    throw new Error('Failed to fetch blob content');
  }
  const content = await response.text();
  console.log('Blob content response:', {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    contentLength: content.length,
    preview: content.slice(0, 100) + (content.length > 100 ? '...' : '')
  });
  return content;
}

export async function putBlob(pathname: string, content: string | File | null): Promise<BlobResult> {
  console.log('Calling list API before put...');
  const { blobs } = await list();
  console.log('List API Response:', JSON.stringify(blobs, null, 2));

  const existingFiles = blobs.filter(
    (blob) => blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === pathname
  );
  console.log('Found existing files:', JSON.stringify(existingFiles, null, 2));

  for (const oldVersion of existingFiles) {
    console.log('Deleting old version:', oldVersion.url);
    await del(oldVersion.url);
  }

  const isFolder = pathname.endsWith('/');
  if (isFolder) {
    console.log('Creating folder:', pathname);
    const result = await createFolder(pathname);
    return {
      type: 'folder',
      url: result.url,
    } satisfies BlobFolderResult;
  }

  content = handleEmptyContent(content, pathname);

  console.log('Calling put API with:', {
    pathname,
    contentType: content instanceof File ? content.type : typeof content,
    isFolder
  });

  const result = await put(pathname, content, {
    access: 'public',
    addRandomSuffix: true,
    addRandomSuffix: true
  });
  console.log('Put API Response:', JSON.stringify(result, null, 2));
  return {
    type: 'file',
    url: result.url,
    downloadUrl: result.downloadUrl
  } satisfies BlobFileResult;
}

export async function deleteBlob(url: string) {
  console.log('Calling delete API for URL:', url);
  await del(url);
  console.log('Delete API completed');
}
