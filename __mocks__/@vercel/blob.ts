import { randomBytes } from 'crypto';
import type { PutBlobResult } from '@vercel/blob';

interface MockBlob extends PutBlobResult {
  size: number;
  uploadedAt: string;
}

// 模拟数据存储
let mockBlobs: MockBlob[] = [];

// 生成随机后缀
const generateSuffix = () => randomBytes(10).toString('hex');

// 模拟 list 函数
export async function list() {
  return {
    blobs: mockBlobs,
    cursor: null,
  };
}

// 模拟 put 函数
export async function put(pathname: string, content: string | File, options: any = {}): Promise<MockBlob> {
  const isFolder = pathname.endsWith('/');
  const suffix = options.addRandomSuffix ? `-${generateSuffix()}` : '';
  const finalPathname = isFolder ? pathname : `${pathname}${suffix}`;
  
  const blob: MockBlob = {
    url: `https://mock.blob.vercel-storage.com/${finalPathname}`,
    downloadUrl: `https://mock.blob.vercel-storage.com/${finalPathname}?download=1`,
    pathname: finalPathname,
    size: isFolder ? 0 : (content instanceof File ? content.size : content.length),
    uploadedAt: new Date().toISOString(),
    contentType: isFolder ? 'application/x-directory' : 'text/plain;charset=UTF-8',
    contentDisposition: isFolder 
      ? 'attachment; filename="unnamed"'
      : `attachment; filename="${pathname}"`,
  };

  mockBlobs.push(blob);
  return blob;
}

// 模拟 del 函数
export async function del(url: string) {
  mockBlobs = mockBlobs.filter(blob => blob.url !== url);
  return true;
}

// 重置 mock 数据的辅助函数
export function __resetMockData() {
  mockBlobs = [];
}

// 设置初始 mock 数据的辅助函数
export function __setMockData(data: MockBlob[]) {
  mockBlobs = [...data];
}
