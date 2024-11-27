describe('Subfolder File Creation Tests', () => {
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

  it('[FCS-01] should create new file in subfolder using path prefix using entry key', () => {
    // 直接在输入框中输入完整路径（包括回车）
    cy.get("input[placeholder*='Enter name']").type(
      'folder/newfile-prefix.txt{enter}'
    );

    // 等待文件创建请求完成
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);

    // 验证文件创建成功并且父文件夹自动展开并被选中
    cy.get('[role="tree"]').within(() => {
      cy.get('[role="treeitem"]').contains('folder').should('be.visible');
      cy.get('[role="treeitem"]')
        .contains('newfile-prefix.txt')
        .should('be.visible');
    });
    // 创建文件后应该被选中
    cy.get('[role="treeitem"]')
      .contains('newfile-prefix.txt')
      .parent()
      .should('have.class', 'bg-accent');
    // 验证编辑器标题包含文件名和前缀
    cy.contains('h2', 'Editing: folder/newfile-prefix.txt').should(
      'be.visible'
    );
    // 使用 ARIA 选择器验证 prefix
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');
  });

  it('[FCS-02] should create new file in subfolder using path prefix using mouse click', () => {
    // 在输入框中输入完整路径
    cy.get("input[placeholder*='Enter name']").type(
      'folder/newfile-prefix-click.txt'
    );

    // 点击创建按钮
    cy.get("button[title='Create File (Enter)']").click();

    // 等待文件创建请求完成
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);

    // 验证文件创建成功并且父文件夹自动展开并被选中
    cy.get('[role="treeitem"][data-type="file"]')
      .contains('newfile-prefix-click.txt')
      .parents('[role="treeitem"][data-type="directory"]')
      .first()
      .within(() => {
        cy.contains('folder').should('exist');
      });

    // 创建文件后应该被选中
    cy.get('[role="treeitem"]')
      .contains('newfile-prefix-click.txt')
      .parent()
      .should('have.class', 'bg-accent');

    // 验证编辑器标题包含文件名和前缀
    cy.contains('h2', 'Editing: folder/newfile-prefix-click.txt').should(
      'be.visible'
    );

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');
  });

  it('[FCS-03] creates file in subfolder via folder add button', () => {
    cy.contains('[role="treeitem"]', 'folder')
      .realHover({ position: 'right' })
      .find('button[aria-label="Add path to create target"]')
      .click();

    // 输入文件名并按回车
    cy.get("input[placeholder*='Enter name']").type(
      'newfile-folder-click.txt{enter}'
    );

    // 验证文件创建成功并且在 folder 文件夹下
    cy.get('[role="treeitem"][data-type="file"]')
      .contains('newfile-folder-click.txt')
      .parents('[role="treeitem"][data-type="directory"]')
      .first()
      .within(() => {
        cy.contains('folder').should('exist');
      });

    // 创建文件后应该被选中
    cy.get('[role="treeitem"]')
      .contains('newfile-folder-click.txt')
      .parent()
      .should('have.class', 'bg-accent');

    // 验证编辑器标题
    cy.contains('h2', 'Editing: folder/newfile-folder-click.txt').should(
      'be.visible'
    );

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');

    // 验证文件创建请求
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);
  });

  it('[FCS-04][bugfix] should respect current directory when creating file with path', () => {
    // 添加 other 文件夹
    cy.get("input[placeholder*='Enter name']").type('folder/other/{enter}');

    // 点击 folder 的按钮，设置当前目录
    // 使用 [role="presentation"] 来避免选择到子文件夹
    cy.contains('[role="presentation"]', 'folder')
      .realHover({ position: 'right' })
      .find('button[aria-label="Add path to create target"]')
      .click();

    // 验证当前目录前缀显示正确
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/');
    });

    // 尝试在输入框中输入带有其他目录的路径
    cy.get("input[placeholder*='Enter name']").type('other/test.txt{enter}');

    // 等待文件创建请求完成
    cy.wait('@putFile').then((interception) => {
      // 验证实际创建的文件路径是在当前目录下
      expect(interception.request.url).to.include('folder/other/test.txt');
    });

    // 验证文件创建成功并且在正确的目录下
    cy.get('[role="treeitem"][data-type="file"]')
      .contains('test.txt')
      .parents('[role="treeitem"][data-type="directory"]')
      .first()
      .within(() => {
        cy.contains('other').should('exist');
      });

    // 验证当前目录前缀显示正确
    cy.get('[aria-label="current directory"]').should((el) => {
      expect(el.text().trim()).to.equal('folder/other/');
    });

    // 验证编辑器标题
    cy.contains('h2', 'Editing: folder/other/test.txt').should('be.visible');
  });
});
