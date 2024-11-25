describe.only('Folder Creation Tests', () => {
  const mockFiles = [
    { pathname: 'folder/', isFolder: true },
    { pathname: 'folder/test.txt', content: 'test content' },
    { pathname: 'root.txt', content: 'root content' },
  ];

  beforeEach(() => {
    blobStorageMock.reset().addFiles(mockFiles).setupInterceptors();
    cy.visit('http://localhost:3000');
    cy.wait('@listBlobs');
  });

  it('[FOL-01] should create folder in root using Shift+Enter', () => {
    // 使用 Shift+Enter 创建文件夹
    cy.get("input[placeholder*='Enter name']")
      .type('new-folder')
      .type('{shift}{enter}');

    // 验证文件夹创建成功
    cy.get('[role="tree"]').within(() => {
      cy.get('[role="treeitem"]').contains('new-folder').should('be.visible');
    });

    // 验证创建请求
    cy.wait('@putFolder').then((interception) => {
      expect(interception.request.url).to.include('new-folder/');
      expect(interception.response?.statusCode).to.equal(200);
    });
  });

  it('[FOL-02] should create nested folder using path prefix', () => {
    // 创建嵌套文件夹
    cy.get("input[placeholder*='Enter name']")
      .type('folder/nested-folder')
      .type('{shift}{enter}');

    // 验证父文件夹展开并显示新文件夹
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('folder')
      .closest('[role="treeitem"]')
      .find('[role="group"]')
      .first()
      .within(() => {
        cy.get('[role="treeitem"][data-type="directory"]')
          .contains('nested-folder')
          .should('be.visible');
      });

    // 验证创建请求
    cy.wait('@putFolder').then((interception) => {
      expect(interception.request.url).to.include('folder/nested-folder/');
      expect(interception.response?.statusCode).to.equal(200);
    });

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/nested-folder/');
    });
  });

  it('[FOL-03] should create folder using folder button', () => {
    cy.get("input[placeholder*='Enter name']").type('button-folder');

    // 点击创建文件夹按钮 - 使用 title 属性
    cy.get("button[title='Create Folder (Shift+Enter)']").click();

    // 验证文件夹创建成功
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('button-folder')
      .should('be.visible');

    // 验证创建请求
    cy.wait('@putFolder').then((interception) => {
      expect(interception.request.url).to.include('button-folder/');
      expect(interception.response?.statusCode).to.equal(200);
    });

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('button-folder/');
    });
  });

  it('[FOL-04] should create nested folder using current directory', () => {
    // 先点击 folder 设置当前目录 - 使用 ARIA 标签
    cy.contains('[role="presentation"]', 'folder')
      .realHover()
      .find('button[aria-label="Create file in folder"]')
      .click();

    // 创建文件夹
    cy.get("input[placeholder*='Enter name']")
      .type('current-dir-folder')
      .type('{shift}{enter}');

    // 验证文件夹在正确的位置创建
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('folder')
      .closest('[role="treeitem"]')
      .find('[role="group"]')
      .first()
      .within(() => {
        cy.get('[role="treeitem"][data-type="directory"]')
          .contains('current-dir-folder')
          .should('be.visible');
      });

    // 验证创建请求
    cy.wait('@putFolder').then((interception) => {
      expect(interception.request.url).to.include('folder/current-dir-folder/');
      expect(interception.response?.statusCode).to.equal(200);
    });

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/current-dir-folder/');
    });
  });

  it('[FOL-05] should handle folder creation validation', () => {
    // 测试重复文件夹名
    cy.get("input[placeholder*='Enter name']")
      .type('folder')
      .type('{shift}{enter}');
    cy.contains('File or folder already exists').should('be.visible');

    // 测试无效字符
    cy.get("input[placeholder*='Enter name']")
      .clear()
      .type('invalid*folder')
      .type('{shift}{enter}');
    cy.contains('Name contains invalid characters').should('be.visible');

    // 测试不存在的父文件夹
    cy.get("input[placeholder*='Enter name']")
      .clear()
      .type('nonexistent/folder')
      .type('{shift}{enter}');
    cy.contains('Parent directory does not exist').should('be.visible');
  });
});
