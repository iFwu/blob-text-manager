'use server';

import { list, put, del } from '@vercel/blob';
import { BlobFile } from '../types';

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
  const { blobs } = await list();

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
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch blob content');
  }
  const content = await response.text();
  return content;
}

export async function putBlob(pathname: string, content: string | File | null) {
  const { blobs } = await list();
  const existingFiles = blobs.filter(
    (blob) => blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === pathname
  );

  // 如果文件已存在，删除所有旧版本
  for (const oldVersion of existingFiles) {
    await del(oldVersion.url);
  }

  const isFolder = pathname.endsWith('/');
  if (isFolder) {
    content = new File([], pathname, { type: 'application/x-empty' });
  } else {
    content = handleEmptyContent(content, pathname);
  }

  const result = await put(pathname, content, {
    access: 'public',
    addRandomSuffix: !isFolder,
  });
  return result;
}

export async function deleteBlob(url: string) {
  await del(url);
}
