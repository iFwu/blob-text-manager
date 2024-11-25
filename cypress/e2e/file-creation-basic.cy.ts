describe('Basic File Creation Tests', () => {
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

  it('[FCB-01] should create new file in root directory using mouse click', () => {
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

    // 创建文件后应该被选中
    cy.get('[role="treeitem"]')
      .contains('newfile-click.txt')
      .parent()
      .should('have.class', 'bg-accent');
  });

  it('[FCB-02] should create new file in root directory using Enter key', () => {
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

    // 创建文件后应该被选中
    cy.get('[role="treeitem"]')
      .contains('newfile-enter.txt')
      .parent()
      .should('have.class', 'bg-accent');
  });
});
