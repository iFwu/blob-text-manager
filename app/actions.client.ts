'use client';

import { list, put, del, createFolder } from '@vercel/blob';
import { BlobFile, BlobResult, BlobFileResult, BlobFolderResult } from '../types';

const ZERO_WIDTH_SPACE = '\u200B';
const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;

console.log('Debug: actions.client.ts - Environment:', {
  NEXT_PUBLIC_IS_TEST: process.env.NEXT_PUBLIC_IS_TEST,
  NODE_ENV: process.env.NODE_ENV,
  hasToken: !!token
});

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
  console.log('Debug: actions.client.ts - listBlobs called');
  const { blobs } = await list({ token });
  console.log('Debug: actions.client.ts - listBlobs response:', {
    count: blobs.length,
    firstFew: blobs.slice(0, 3)
  });

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

  console.log('Debug: actions.client.ts - listBlobs processed:', {
    count: processedBlobs.length,
    firstFew: processedBlobs.slice(0, 3)
  });

  return processedBlobs;
}

export async function getBlob(url: string): Promise<string> {
  console.log('Debug: actions.client.ts - getBlob called:', { url });
  const response = await fetch(url);
  if (!response.ok) {
    console.error('Debug: actions.client.ts - getBlob failed:', {
      status: response.status,
      statusText: response.statusText
    });
    throw new Error('Failed to fetch blob content');
  }
  const content = await response.text();
  console.log('Debug: actions.client.ts - getBlob success:', {
    status: response.status,
    contentLength: content.length
  });
  return content;
}

export async function putBlob(
  pathname: string,
  content: string | File | null
): Promise<BlobResult> {
  console.log('Debug: actions.client.ts - putBlob called:', {
    pathname,
    contentType: content instanceof File ? content.type : typeof content
  });

  const { blobs } = await list({ token });
  const existingFiles = blobs.filter(
    (blob) => blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === pathname
  );

  for (const oldVersion of existingFiles) {
    console.log('Debug: actions.client.ts - Deleting old version:', oldVersion.url);
    await del(oldVersion.url, { token });
  }

  const isFolder = pathname.endsWith('/');
  if (isFolder) {
    console.log('Debug: actions.client.ts - Creating folder:', pathname);
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

  console.log('Debug: actions.client.ts - putBlob success:', {
    url: result.url,
    pathname: result.pathname
  });

  return {
    type: 'file',
    url: result.url,
    downloadUrl: result.downloadUrl,
  } satisfies BlobFileResult;
}

export async function deleteBlob(url: string) {
  console.log('Debug: actions.client.ts - deleteBlob called:', { url });
  await del(url, { token });
  console.log('Debug: actions.client.ts - deleteBlob success');
}
