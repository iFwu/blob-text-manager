/**
 * Mock service for Vercel Blob Storage API
 * Provides in-memory storage and API interception for E2E testing
 */

interface MockFile {
  pathname: string;
  content?: string;
  isFolder?: boolean;
}

export class BlobStorageMock {
  private files = new Map<string, any>();

  private generateUrl(pathname: string, isFolder = false) {
    const cleanPath = pathname.replace(/\/+$/, '');
    const suffix = isFolder ? '' : `-${Math.random().toString(36).slice(2, 8)}`;
    return `https://mock.blob.vercel-storage.com/${cleanPath}${suffix}${isFolder ? '/' : ''}`;
  }

  /**
   * Reset mock state and set up interceptors with optional initial files
   */
  reset(initialFiles: MockFile[] = []) {
    this.files.clear();

    if (initialFiles.length > 0) {
      this.addFiles(initialFiles);
    }

    this.setupInterceptors();
    return this;
  }

  /**
   * Add files to the mock storage
   */
  addFiles(files: MockFile[]) {
    files.forEach((file) => {
      const url = this.generateUrl(file.pathname, file.isFolder);
      const downloadUrl = `${url}?download=1`;

      if (file.isFolder) {
        const normalizedPathname = file.pathname.endsWith('/')
          ? file.pathname
          : `${file.pathname}/`;
        this.files.set(url, {
          url,
          downloadUrl,
          pathname: normalizedPathname,
          contentType: 'application/x-directory',
          contentDisposition: 'attachment; filename="unnamed"',
          size: 0,
          uploadedAt: new Date().toISOString(),
        });
      } else {
        this.files.set(url, {
          url,
          downloadUrl,
          pathname: file.pathname,
          contentType: 'text/plain;charset=UTF-8',
          contentDisposition: `attachment; filename="${file.pathname}"`,
          content: file.content || '',
          size: file.content?.length || 0,
          uploadedAt: new Date().toISOString(),
        });
      }
    });

    return this;
  }

  /**
   * Set up interceptors for all blob operations
   */
  setupInterceptors() {
    // Mock list blobs
    cy.intercept('GET', 'https://blob.vercel-storage.com/?*', {
      statusCode: 200,
      headers: {
        'cache-control': 'public, max-age=0, must-revalidate',
        'content-type': 'application/json; charset=utf-8',
      },
      body: {
        hasMore: false,
        blobs: Array.from(this.files.values()),
      },
    }).as('listBlobs');

    // Mock put blob (file)
    cy.intercept('PUT', /blob\.vercel-storage\.com\/(?!.*\/$).*/, (req) => {
      const pathname = req.url.split('blob.vercel-storage.com/')[1];
      if (!pathname) {
        req.reply({ statusCode: 404 });
        return;
      }
      const url = this.generateUrl(pathname);
      const downloadUrl = `${url}?download=1`;
      const content = req.body;
      const response = {
        url,
        downloadUrl,
        pathname,
        contentType: 'text/plain;charset=UTF-8',
        contentDisposition: `attachment; filename="${pathname}"`,
      };
      this.files.set(url, {
        ...response,
        content,
        size: content?.length || 0,
        uploadedAt: new Date().toISOString(),
      });
      req.reply({
        statusCode: 200,
        headers: {
          'cache-control': 'public, max-age=86400',
          'content-type': 'application/json; charset=utf-8',
        },
        body: response,
      });
    }).as('putFile');

    // Mock put blob (folder)
    cy.intercept('PUT', /blob\.vercel-storage\.com\/.*\/$/, (req) => {
      const pathname = req.url.split('blob.vercel-storage.com/')[1];
      const normalizedPathname = pathname?.endsWith('/')
        ? pathname
        : `${pathname}/`;
      const url = this.generateUrl(normalizedPathname, true);
      const downloadUrl = `${url}?download=1`;
      const response = {
        url,
        downloadUrl,
        pathname: normalizedPathname,
        contentType: 'application/x-directory',
        contentDisposition: 'attachment; filename="unnamed"',
      };
      this.files.set(url, {
        ...response,
        size: 0,
        uploadedAt: new Date().toISOString(),
      });
      req.reply({
        statusCode: 200,
        body: response,
      });
    }).as('putFolder');

    // Mock delete blob
    cy.intercept('POST', 'https://blob.vercel-storage.com/delete', (req) => {
      const urls = req.body.urls;
      urls.forEach((url: string) => this.files.delete(url));
      req.reply({
        statusCode: 200,
        headers: {
          'cache-control': 'public, max-age=0, must-revalidate',
        },
        body: null,
      });
    }).as('deleteBlob');

    // Mock get blob content
    cy.intercept('GET', /mock\.blob\.vercel-storage\.com.*/, (req) => {
      const url = req.url.split('?')[0];
      const file = url ? this.files.get(url) : null;
      if (!file) {
        req.reply({ statusCode: 404 });
        return;
      }
      req.reply({
        statusCode: 200,
        headers: {
          'content-disposition': file.contentDisposition,
          'content-type': file.contentType,
          'last-modified': file.uploadedAt,
        },
        body: file.content || '',
      });
    }).as('getBlobContent');

    return this;
  }
}

export const blobStorageMock = new BlobStorageMock();
