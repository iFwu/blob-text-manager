describe('File and Folder Deletion Tests', () => {
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
      .realHover({ position: 'right' })
      .find('button[aria-label="Delete file"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件被删除
    cy.contains('[role="treeitem"]', 'root-file.txt').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls)
        .to.be.an('array')
        .that.has.length(1);
      expect(interception.request.body.urls[0]).to.match(
        /^https:\/\/mock\.blob\.vercel-storage\.com\/root-file\.txt-[a-z0-9]+$/
      );
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[DEL-02] should delete file in subfolder', () => {
    // 打开文件夹
    cy.contains('[role="treeitem"]', 'test-folder').click();

    // 选择文件并删除
    cy.contains('[role="treeitem"]', 'nested.txt')
      .realHover({ position: 'right' })
      .find('button[aria-label="Delete file"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件被删除
    cy.contains('[role="treeitem"]', 'nested.txt').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls)
        .to.be.an('array')
        .that.has.length(1);
      expect(interception.request.body.urls[0]).to.match(
        /^https:\/\/mock\.blob\.vercel-storage\.com\/test-folder\/nested\.txt-[a-z0-9]+$/
      );
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[DEL-03] should delete empty folder', () => {
    // 选择空文件夹
    cy.contains('[role="treeitem"]', 'empty-folder')
      .realHover({ position: 'right' })
      .find('button[aria-label="Delete folder"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件夹被删除
    cy.contains('[role="treeitem"]', 'empty-folder').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls)
        .to.be.an('array')
        .that.has.length(1);
      expect(interception.request.body.urls[0]).to.match(
        /^https:\/\/mock\.blob\.vercel-storage\.com\/empty-folder\/$/
      );
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');
  });

  it('[DEL-04] should delete non-empty folder with confirmation', () => {
    // 选择非空文件夹
    cy.contains('[role="treeitem"]', 'test-folder')
      .realHover({ position: 'right' })
      .find('button[aria-label="Delete folder"]')
      .click();

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证文件夹及其内容被删除
    cy.contains('[role="treeitem"]', 'test-folder').should('not.exist');
    cy.contains('[role="treeitem"]', 'nested.txt').should('not.exist');
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls)
        .to.be.an('array')
        .that.has.length(2);
      expect(interception.request.body.urls[0]).to.match(
        /^https:\/\/mock\.blob\.vercel-storage\.com\/test-folder\/$/
      );
      expect(interception.request.body.urls[1]).to.match(
        /^https:\/\/mock\.blob\.vercel-storage\.com\/test-folder\/nested\.txt-[a-z0-9]+$/
      );
    });

    // 删除完成后移除loading状态
    cy.get('.animate-spin').should('not.exist');
  });

  it('[DEL-05] should not delete when cancelled', () => {
    // 选择文件
    cy.contains('[role="treeitem"]', 'root-file.txt')
      .realHover({ position: 'right' })
      .find('button[aria-label="Delete file"]')
      .click();

    // 点击取消按钮
    cy.get('button').contains('Cancel').click();

    // 验证文件未被删除
    cy.contains('[role="treeitem"]', 'root-file.txt').should('exist');
    // 不应该有删除 API 调用
    cy.get('@deleteBlob').should('not.exist');
  });

  it('[DEL-06] should delete all files with confirmation', () => {
    // 点击删除全部按钮
    cy.get('button[aria-label="Delete all files"]').click();

    // 验证警告标题和内容
    cy.contains('⚠️ Dangerous Operation').should('be.visible');
    cy.contains('This is a destructive action that cannot be undone').should(
      'be.visible'
    );

    // 验证删除按钮在输入确认文本前是禁用的
    cy.get('button').contains('Delete').should('be.disabled');

    // 输入错误的确认文本
    cy.get('input[placeholder*="delete all"]').type('delete');
    cy.get('button').contains('Delete').should('be.disabled');

    // 输入正确的确认文本
    cy.get('input[placeholder*="delete all"]').clear().type('delete all');
    cy.get('button').contains('Delete').should('not.be.disabled');

    // 确认删除
    cy.get('button').contains('Delete').click();

    // 验证所有文件和文件夹被删除
    cy.contains('[role="treeitem"]', 'empty-folder').should('not.exist');
    cy.contains('[role="treeitem"]', 'test-folder').should('not.exist');
    cy.contains('[role="treeitem"]', 'root-file.txt').should('not.exist');

    // 验证删除 API 调用
    cy.wait('@deleteBlob').then((interception) => {
      expect(interception.request.body.urls)
        .to.be.an('array')
        .that.has.length(4); // 所有文件和文件夹

      // 验证所有 URL 都被包含在请求中
      const urls = interception.request.body.urls as string[];
      expect(urls.some((url) => url.includes('empty-folder'))).to.be.true;
      expect(urls.some((url) => url.includes('test-folder/'))).to.be.true;
      expect(urls.some((url) => url.includes('test-folder/nested.txt'))).to.be
        .true;
      expect(urls.some((url) => url.includes('root-file.txt'))).to.be.true;
    });

    // 验证编辑器显示默认提示文本
    cy.contains('Select a file to edit').should('be.visible');

    // 删除完成后移除loading状态
    cy.get('.animate-spin').should('not.exist');
  });

  it('[DEL-07] should not delete all files when cancelled', () => {
    // 点击删除全部按钮
    cy.get('button[aria-label="Delete all files"]').click();

    // 输入确认文本
    cy.get('input[placeholder*="delete all"]').type('delete all');

    // 点击取消按钮
    cy.get('button').contains('Cancel').click();

    // 验证所有文件和文件夹仍然存在
    cy.contains('[role="treeitem"]', 'empty-folder').should('exist');
    cy.contains('[role="treeitem"]', 'test-folder').should('exist');
    cy.contains('[role="treeitem"]', 'root-file.txt').should('exist');

    // 不应该有删除 API 调用
    cy.get('@deleteBlob').should('not.exist');
  });
});
