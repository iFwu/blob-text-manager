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
  const startTime = Date.now();
  console.log('[Server] Initiating list API request');
  
  const { blobs } = await list();
  console.log('[Server] List API Response:', JSON.stringify(blobs, null, 2));

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

  const endTime = Date.now();
  console.log(`[Server] List API completed - Retrieved ${processedBlobs.length} items in ${endTime - startTime}ms`);
  return processedBlobs;
}

export async function getBlob(url: string): Promise<string> {
  const startTime = Date.now();
  console.log(`[Server] Initiating blob content fetch from: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    console.error('[Server] Failed to fetch blob content:', response.status, response.statusText);
    throw new Error('Failed to fetch blob content');
  }
  
  const content = await response.text();
  console.log('[Server] Blob content response:', {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    contentLength: content.length,
    preview: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
  });
  
  const endTime = Date.now();
  console.log(`[Server] Blob fetch completed - Content length: ${content.length} bytes, Time: ${endTime - startTime}ms`);
  return content;
}

export async function putBlob(
  pathname: string,
  content: string | File | null
): Promise<BlobResult> {
  const startTime = Date.now();
  console.log('[Server] Initiating put operation');
  
  console.log('[Server] Listing existing blobs...');
  const { blobs } = await list();
  console.log('[Server] List API Response:', JSON.stringify(blobs, null, 2));

  const existingFiles = blobs.filter(
    (blob) => blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === pathname
  );
  console.log('[Server] Found existing files:', JSON.stringify(existingFiles, null, 2));

  for (const oldVersion of existingFiles) {
    console.log('[Server] Deleting old version:', oldVersion.url);
    await del(oldVersion.url);
  }

  const isFolder = pathname.endsWith('/');
  if (isFolder) {
    console.log('[Server] Creating folder:', pathname);
    const result = await createFolder(pathname);
    const endTime = Date.now();
    console.log(`[Server] Folder creation completed in ${endTime - startTime}ms`);
    return {
      type: 'folder',
      url: result.url,
    } satisfies BlobFolderResult;
  }

  content = handleEmptyContent(content, pathname);

  console.log('[Server] Calling put API with:', {
    pathname,
    contentType: content instanceof File ? content.type : typeof content,
    isFolder,
  });

  const result = await put(pathname, content, {
    access: 'public',
    addRandomSuffix: true,
  });
  
  const endTime = Date.now();
  console.log('[Server] Put API Response:', JSON.stringify(result, null, 2));
  console.log(`[Server] Put operation completed in ${endTime - startTime}ms`);
  
  return {
    type: 'file',
    url: result.url,
    downloadUrl: result.downloadUrl,
  } satisfies BlobFileResult;
}

export async function deleteBlob(url: string) {
  const startTime = Date.now();
  console.log(`[Server] Initiating delete API request for: ${url}`);
  
  await del(url);
  
  const endTime = Date.now();
  console.log(`[Server] Delete API completed - Time: ${endTime - startTime}ms`);
}
