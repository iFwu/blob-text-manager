describe("File and Folder Deletion Tests", () => {
  const mockFiles = [
    { pathname: 'empty-folder/', isFolder: true },
    { pathname: 'test-folder/', isFolder: true },
    { pathname: 'test-folder/nested.txt', content: 'nested content' },
    { pathname: 'root-file.txt', content: 'root content' },
  ];

  beforeEach(() => {
    blobStorageMock.reset().addFiles(mockFiles).setupInterceptors();

    cy.visit('http://localhost:3000');
    cy.wait('@listBlobs');
  });

  it('[DEL-01] should delete file in root directory', () => {
    // 选择根目录文件
    cy.contains('[role="treeitem"]', 'root-file.txt')
      .realHover()
      .find('button[aria-label="Delete file"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件被删除
    cy.contains('[role="treeitem"]', 'root-file.txt').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls).to.be.an('array').that.has.length(1);
      expect(interception.request.body.urls[0]).to.match(/^https:\/\/mock\.blob\.vercel-storage\.com\/root-file\.txt-[a-z0-9]+$/);
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[DEL-02] should delete file in subfolder', () => {
    // 打开文件夹
    cy.contains('[role="treeitem"]', 'test-folder').click();

    // 选择文件并删除
    cy.contains('[role="treeitem"]', 'nested.txt')
      .realHover()
      .find('button[aria-label="Delete file"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件被删除
    cy.contains('[role="treeitem"]', 'nested.txt').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls).to.be.an('array').that.has.length(1);
      expect(interception.request.body.urls[0]).to.match(/^https:\/\/mock\.blob\.vercel-storage\.com\/test-folder\/nested\.txt-[a-z0-9]+$/);
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[DEL-03] should delete empty folder', () => {
    // 选择空文件夹
    cy.contains('[role="treeitem"]', 'empty-folder')
      .realHover()
      .find('button[aria-label="Delete folder"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件夹被删除
    cy.contains('[role="treeitem"]', 'empty-folder').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls).to.be.an('array').that.has.length(1);
      expect(interception.request.body.urls[0]).to.match(/^https:\/\/mock\.blob\.vercel-storage\.com\/empty-folder\/$/);
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[DEL-04] should delete non-empty folder with confirmation', () => {
    // 选择非空文件夹
    cy.contains('[role="treeitem"]', 'test-folder')
      .realHover()
      .find('button[aria-label="Delete folder"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件夹及其内容被删除
    cy.contains('[role="treeitem"]', 'test-folder').should('not.exist');
    cy.contains('[role="treeitem"]', 'nested.txt').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls).to.be.an('array').that.has.length(2);
      expect(interception.request.body.urls[0]).to.match(/^https:\/\/mock\.blob\.vercel-storage\.com\/test-folder\/$/);
      expect(interception.request.body.urls[1]).to.match(/^https:\/\/mock\.blob\.vercel-storage\.com\/test-folder\/nested\.txt-[a-z0-9]+$/);
    });

    // 删除完成后移除loading状态
    cy.get('.animate-spin').should('not.exist');
  });

  it('[DEL-05] should not delete when cancelled', () => {
    // 选择文件
    cy.contains('[role="treeitem"]', 'root-file.txt')
      .realHover()
      .find('button[aria-label="Delete file"]')
      .click();

    // 点击取消按钮
    cy.get('button').contains('Cancel').click();

    // 验证文件未被删除
    cy.contains('[role="treeitem"]', 'root-file.txt').should('exist');
    // 不应该有删除 API 调用
    cy.get('@deleteBlob').should('not.exist');
  });
});
