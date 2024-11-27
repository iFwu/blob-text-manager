describe('File Creation Validation Tests', () => {
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

  it('[FCV-01] should not create file with invalid characters', () => {
    const invalidChars = ['<', '>', ':', '"', '|', '?', '*', '\\'];

    for (const char of invalidChars) {
      cy.get("input[placeholder*='Enter name']")
        .clear()
        .type(`test${char}file.txt{enter}`);
      cy.contains('Name contains invalid characters').should('be.visible');
    }
  });

  it('[FCV-02] should not create file in non-existent directory', () => {
    cy.get("input[placeholder*='Enter name']").type(
      'nonexistent/file.txt{enter}'
    );
    cy.contains('Parent directory does not exist').should('be.visible');
  });

  it('[FCV-03] should not create duplicate files', () => {
    // 先创建一个文件
    cy.get("input[placeholder*='Enter name']").type('test.txt{enter}');
    cy.wait('@putFile');

    // 尝试创建同名文件
    cy.get("input[placeholder*='Enter name']").type('test.txt{enter}');
    cy.contains('File or folder already exists').should('be.visible');
  });

  it('[FCV-04] should not create file with . or .. in path', () => {
    cy.get("input[placeholder*='Enter name']").type(
      'folder/../test.txt{enter}'
    );
    cy.contains('Invalid path: cannot contain . or ..').should('be.visible');
  });

  it('[FCV-05] should not create folder with same name as existing file', () => {
    // 先创建文件
    cy.get("input[placeholder*='Enter name']").type('test.txt{enter}');
    cy.wait('@putFile');

    // 尝试创建同名文件夹
    cy.get("input[placeholder*='Enter name']")
      .type('test.txt')
      .type('{shift}{enter}');
    cy.contains('File or folder already exists').should('be.visible');
  });
});
