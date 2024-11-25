describe('File Display Tests', () => {
  const mockFiles = [
    { pathname: 'folder/', isFolder: true },
    { pathname: 'folder/test.txt', content: 'test content' },
    { pathname: 'root.txt', content: 'root content' },
  ];

  beforeEach(() => {
    blobStorageMock.reset().setupInterceptors();
  });

  it('[FD-01] should load empty file list when no files exist', () => {
    cy.visit('http://localhost:3000');
    cy.get('h1').should('contain', 'Blob Text Manager');
    cy.get('.flex.items-center').should('exist');
    cy.wait('@listBlobs').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.body.blobs).to.be.an('array');
      expect(interception.response?.body.blobs).to.have.length(0);
    });

    // 验证文件列表为空时的状态
    cy.get('h2').contains('Files').should('be.visible');
    cy.get('[role="tree"]').should(($tree) => {
      expect($tree.text().trim()).to.equal('');
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[FD-02] should load and display files and folders correctly', () => {
    blobStorageMock.reset().addFiles(mockFiles).setupInterceptors();

    cy.visit('http://localhost:3000');

    cy.wait('@listBlobs').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(interception.response?.body.blobs).to.have.length(
        mockFiles.length
      );
    });

    // 验证 TreeView 组件存在并包含正确的文件和文件夹
    cy.get('[role="tree"]').within(() => {
      cy.get('[role="treeitem"]').contains('folder').should('be.visible');
      cy.get('[role="treeitem"]').contains('root.txt').should('be.visible');

      // 点击展开文件夹
      cy.get('[role="treeitem"]').contains('folder').click();
      cy.get('[role="treeitem"]').contains('test.txt').should('be.visible');
    });
  });
});
