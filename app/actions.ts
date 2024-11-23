'use server';

import { list, put, del } from '@vercel/blob';
import { BlobFile } from '../types';

const ZERO_WIDTH_SPACE = '\u200B';

function handleEmptyContent(content: string | File | null, name: string): string | File {
  if (typeof content === 'string') {
    return content.trim() === '' ? ZERO_WIDTH_SPACE : content.replace(/^\u200B/, '');
  } else if (content instanceof File && content.size === 0) {
    return new File([ZERO_WIDTH_SPACE], name, { type: content.type });
  }
  if (!content) {
    return new File([ZERO_WIDTH_SPACE], name, { type: 'text/plain' });
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
    name: blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1'),
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

export async function putBlob(name: string, content: string | File | null) {
  const { blobs } = await list();
  const existingFile = blobs.find(
    (blob) => blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === name
  );

  if (!existingFile) {
    return createNewFile(name, content);
  }

  const oldVersions = blobs.filter(
    (blob) => blob.pathname.replace(/-[a-zA-Z0-9]{21}(\.[^.]+)?$/, '$1') === name
  );

  for (const oldVersion of oldVersions) {
    await del(oldVersion.url);
  }

  const isFolder = name.endsWith('/');
  if (isFolder) {
    content = new File([], name, { type: 'application/x-empty' });
  } else {
    content = handleEmptyContent(content, name);
  }
  const result = await put(name, content, {
    access: 'public',
    addRandomSuffix: true,
  });
  return result;
}

async function createNewFile(name: string, content: string | File | null) {
  const isFolder = name.endsWith('/');
  if (isFolder) {
    content = new File([], name, { type: 'application/x-empty' });
  } else {
    content = handleEmptyContent(content, name);
  }
  const result = await put(name, content, {
    access: 'public',
    addRandomSuffix: true,
  });
  return result;
}

export async function deleteBlob(url: string) {
  await del(url);
}
