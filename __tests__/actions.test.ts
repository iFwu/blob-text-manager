import { listBlobs, putBlob, deleteBlob } from '../app/actions';
import { __resetMockData, __setMockData } from '../__mocks__/@vercel/blob';
import type { PutBlobResult } from '@vercel/blob';

interface MockBlob extends PutBlobResult {
  size: number;
  uploadedAt: string;
}

// 示例测试数据
const mockInitialData: MockBlob[] = [
  {
    url: "https://mock.blob.vercel-storage.com/test-folder/",
    downloadUrl: "https://mock.blob.vercel-storage.com/test-folder/?download=1",
    pathname: "test-folder/",
    size: 0,
    uploadedAt: "2024-11-23T12:21:59.000Z",
    contentType: "application/x-directory",
    contentDisposition: "attachment; filename=\"unnamed\""
  },
  {
    url: "https://mock.blob.vercel-storage.com/test-file-123",
    downloadUrl: "https://mock.blob.vercel-storage.com/test-file-123?download=1",
    pathname: "test-file",
    size: 3,
    uploadedAt: "2024-11-23T12:22:05.000Z",
    contentType: "text/plain;charset=UTF-8",
    contentDisposition: "attachment; filename=\"test-file\""
  }
];

describe('Blob Actions', () => {
  beforeEach(() => {
    // 每个测试前重置 mock 数据
    __resetMockData();
  });

  describe('listBlobs', () => {
    it('should list all blobs', async () => {
      // 设置初始数据
      __setMockData(mockInitialData);

      const blobs = await listBlobs();
      expect(blobs).toHaveLength(2);
      
      // 验证文件夹
      const folder = blobs.find(b => b.pathname === 'test-folder/');
      expect(folder).toBeDefined();
      expect(folder?.isDirectory).toBe(true);
      expect(folder?.size).toBe(0);

      // 验证文件
      const file = blobs.find(b => b.pathname === 'test-file');
      expect(file).toBeDefined();
      expect(file?.isDirectory).toBe(false);
      expect(file?.size).toBe(3);
    });
  });

  describe('putBlob', () => {
    it('should create a new folder', async () => {
      const folderName = 'new-folder/';
      const result = await putBlob(folderName, null) as MockBlob;
      
      expect(result.pathname).toBe(folderName);
      expect(result.size).toBe(0);
      expect(result.contentType).toBe('application/x-directory');
    });

    it('should create a new file', async () => {
      const fileName = 'test.txt';
      const content = 'Hello World';
      const result = await putBlob(fileName, content) as MockBlob;
      
      expect(result.pathname).toContain(fileName);
      expect(result.size).toBe(content.length);
      expect(result.contentType).toBe('text/plain;charset=UTF-8');
    });
  });

  describe('deleteBlob', () => {
    it('should delete a blob', async () => {
      // 设置初始数据
      __setMockData(mockInitialData);
      
      // 删除文件
      const fileUrl = mockInitialData[1].url;
      await deleteBlob(fileUrl);
      
      // 验证文件已被删除
      const blobs = await listBlobs();
      expect(blobs).toHaveLength(1);
      expect(blobs[0].pathname).toBe('test-folder/');
    });
  });
});
