describe('Complex File Operations Tests', () => {
  const mockFiles = [
    { pathname: 'folder/', isFolder: true },
    { pathname: 'folder/test.txt', content: 'test content' },
    { pathname: 'folder/subfolder/', isFolder: true },
    { pathname: 'folder/subfolder/existing.txt', content: 'existing content' },
    { pathname: 'root.txt', content: 'root content' },
  ];

  beforeEach(() => {
    blobStorageMock.reset().addFiles(mockFiles).setupInterceptors();
    cy.visit('http://localhost:3000');
    cy.wait('@listBlobs');
  });

  it('[CPX-01][bug] should create file in current directory after selecting existing file', () => {
    // 展开文件夹
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('folder')
      .click();

    // 展开子文件夹
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('subfolder')
      .click();

    // 选择现有文件
    cy.get('[role="treeitem"][data-type="file"]')
      .contains('existing.txt')
      .click();

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/subfolder/');
    });

    // 验证编辑器标题
    cy.contains('h2', 'Editing: folder/subfolder/existing.txt').should(
      'be.visible'
    );

    // 创建新文件
    cy.get("input[placeholder*='Enter name']").type('new-file.txt{enter}');

    // 验证新文件在正确的位置创建
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('subfolder')
      .closest('[role="treeitem"]')
      .find('[role="group"]')
      .within(() => {
        cy.get('[role="treeitem"][data-type="file"]')
          .contains('new-file.txt')
          .should('be.visible');
      });

    // 验证创建请求
    cy.wait('@putFile').then((interception) => {
      expect(interception.request.url).to.include(
        'folder/subfolder/new-file.txt'
      );
      expect(interception.response?.statusCode).to.equal(200);
    });

    // 验证编辑器标题更新
    cy.contains('h2', 'Editing: folder/subfolder/new-file.txt').should(
      'be.visible'
    );
  });

  it('[CPX-02][bug] should change directory when selecting after setting prefix', () => {
    // 展开文件夹
    cy.get('[role="treeitem"][data-type="directory"]')
      .contains('folder')
      .click();

    // 设置前缀
    cy.contains('[role="treeitem"]', 'subfolder')
      .realHover({ position: 'right' })
      .find('[aria-label="Add path to create target"]')
      .click();

    // 验证前缀设置成功
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/subfolder/');
    });

    // 选择文件
    cy.get('[role="treeitem"][data-type="file"]').contains('test.txt').click();

    // 验证编辑器标题
    cy.contains('h2', 'Editing: folder/test.txt').should('be.visible');

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/');
    });
  });
});
