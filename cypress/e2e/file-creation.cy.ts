describe('File Creation Tests', () => {
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

  it('[FC-01] should create new file in root directory using mouse click', () => {
    // 输入文件名
    cy.get("input[placeholder*='Enter name']").type('newfile-click.txt');

    // 点击 PlusIcon 按钮创建文件
    cy.get("button[title='Create File (Enter)']").click();

    // 验证文件创建成功
    cy.get('[role="tree"]').within(() => {
      cy.get('[role="treeitem"]')
        .contains('newfile-click.txt')
        .should('be.visible');
    });
    // 验证编辑器标题包含文件名和前缀
    cy.contains('h2', 'Editing: newfile-click.txt').should('be.visible');
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);
  });

  it('[FC-02] should create new file in root directory using Enter key', () => {
    // 输入文件名并按 Enter 键
    cy.get("input[placeholder*='Enter name']").type('newfile-enter.txt{enter}');

    // 验证文件创建成功
    cy.get('[role="tree"]').within(() => {
      cy.get('[role="treeitem"]')
        .contains('newfile-enter.txt')
        .should('be.visible');
    });
    // 验证编辑器标题包含文件名和前缀
    cy.contains('h2', 'Editing: newfile-enter.txt').should('be.visible');
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);
  });

  it('[FC-03a] should create new file in subfolder using path prefix using entry key', () => {
    // 直接在输入框中输入完整路径（包括回车）
    cy.get("input[placeholder*='Enter name']").type(
      'folder/newfile-prefix.txt{enter}'
    );

    // 等待文件创建请求完成
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);

    // 验证文件创建成功并且父文件夹自动展开
    cy.get('[role="tree"]').within(() => {
      cy.get('[role="treeitem"]').contains('folder').should('be.visible');
      cy.get('[role="treeitem"]')
        .contains('newfile-prefix.txt')
        .should('be.visible');
    });
    // 验证编辑器标题包含文件名和前缀
    cy.contains('h2', 'Editing: folder/newfile-prefix.txt').should(
      'be.visible'
    );
    // 使用 ARIA 选择器验证 prefix
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');
  });

  it('[FC-03b] should create new file in subfolder using path prefix using mouse click', () => {
    // 在输入框中输入完整路径
    cy.get("input[placeholder*='Enter name']").type(
      'folder/newfile-prefix-click.txt'
    );

    // 点击创建按钮
    cy.get("button[title='Create File (Enter)']").click();

    // 等待文件创建请求完成
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);

    // 验证文件创建成功并且父文件夹自动展开
    cy.get('[role="treeitem"][data-type="file"]')
      .contains('newfile-prefix-click.txt')
      .parents('[role="treeitem"][data-type="directory"]')
      .first()
      .within(() => {
        cy.contains('folder').should('exist');
      });

    // 验证编辑器标题包含文件名和前缀
    cy.contains('h2', 'Editing: folder/newfile-prefix-click.txt').should(
      'be.visible'
    );

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');
  });

  it('[FC-04] creates file in subfolder via folder add button', () => {
    // 使用 realHover 来真实模拟鼠标悬停
    cy.contains('[role="treeitem"]', 'folder')
      .realHover()
      .find('button[aria-label="Create file in folder"]')
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

    // 验证编辑器标题
    cy.contains('h2', 'Editing: folder/newfile-folder-click.txt').should(
      'be.visible'
    );

    // 验证当前目录前缀
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');

    // 验证文件创建请求
    cy.wait('@putFile').its('response.statusCode').should('eq', 200);
  });

  it('[FC-05a] should not create file with invalid characters', () => {
    const invalidChars = ['<', '>', ':', '"', '|', '?', '*', '\\'];

    invalidChars.forEach((char) => {
      cy.get("input[placeholder*='Enter name']")
        .clear()
        .type(`test${char}file.txt{enter}`);
      cy.contains('Name contains invalid characters').should('be.visible');
    });
  });

  it('[FC-05b] should not create file in non-existent directory', () => {
    cy.get("input[placeholder*='Enter name']").type(
      'nonexistent/file.txt{enter}'
    );
    cy.contains('Parent directory does not exist').should('be.visible');
  });

  it('[FC-05c] should not create duplicate files', () => {
    // 先创建一个文件
    cy.get("input[placeholder*='Enter name']").type('test.txt{enter}');
    cy.wait('@putFile');

    // 尝试创建同名文件
    cy.get("input[placeholder*='Enter name']").type('test.txt{enter}');
    cy.contains('File or folder already exists').should('be.visible');
  });

  it('[FC-05d] should not create file with . or .. in path', () => {
    cy.get("input[placeholder*='Enter name']").type(
      'folder/../test.txt{enter}'
    );
    cy.contains('Invalid path: cannot contain . or ..').should('be.visible');
  });

  it('[FC-05e] should not create folder with same name as existing file', () => {
    // 先创建文件
    cy.get("input[placeholder*='Enter name']").type('test.txt{enter}');
    cy.wait('@putFile');

    // 尝试创建同名文件夹
    cy.get("input[placeholder*='Enter name']")
      .type('test.txt')
      .type('{shift}{enter}');
    cy.contains('File or folder already exists').should('be.visible');
  });

  it.only('[FC-06] should respect current directory when creating file with path', () => {

    // 添加 other 文件夹
    cy.get("input[placeholder*='Enter name']").type('folder/other/{enter}');

    // 点击 folder 的按钮，设置当前目录
    cy.contains('[role="presentation"]', 'folder')
      .realHover()
      .find('button[aria-label="Create file in folder"]')
      .click();

    // 验证当前目录前缀显示正确
    cy.get('[aria-label="current directory"]').should('have.text', 'folder/');

    // 尝试在输入框中输入带有其他目录的路径
    cy.get("input[placeholder*='Enter name']").type('other/test.txt{enter}');

    // 等待文件创建请求完成
    cy.wait('@putFile').then((interception) => {
      // 验证实际创建的文件路径是在当前目录下
      expect(interception.request.url).to.include('folder/other/test.txt');
    });

    // 验证文件创建成功并且在 other 文件夹下
    cy.get('[role="treeitem"][data-type="file"]')
      .contains('test.txt')
      .parents('[role="treeitem"][data-type="directory"]')
      .first()
      .within(() => {
        cy.contains('other').should('exist');
      });

    // 验证编辑器标题显示完整路径
    cy.contains('h2', 'Editing: folder/other/test.txt').should('be.visible');
  });
});
