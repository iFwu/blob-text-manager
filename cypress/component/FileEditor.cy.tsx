import FileEditor from '@/components/FileEditor';
import { BlobFile } from '@/types';

describe('FileEditor', () => {
  const mockFile: BlobFile = {
    pathname: 'test.txt',
    url: 'https://example.com/test.txt',
    downloadUrl: 'https://example.com/test.txt',
    size: 100,
    uploadedAt: new Date().toISOString(),
    isDirectory: false,
  };

  it('renders empty state', () => {
    cy.mount(
      <FileEditor
        file={null}
        content=""
        onSave={cy.stub().as('onSave')}
        isLoading={false}
      />
    );

    cy.contains('Select a file to edit').should('exist');
  });

  it('renders file content', () => {
    const content = 'Hello, World!';
    cy.mount(
      <FileEditor
        file={mockFile}
        content={content}
        onSave={cy.stub().as('onSave')}
        isLoading={false}
      />
    );

    cy.get('textarea').should('have.value', content);
  });

  it('handles content changes', () => {
    cy.mount(
      <FileEditor
        file={mockFile}
        content="Initial content"
        onSave={cy.stub().as('onSave')}
        isLoading={false}
      />
    );

    const newContent = 'Updated content';
    cy.get('textarea').clear().type(newContent);

    // 触发保存
    cy.get('button').contains('Save').click();

    // 验证保存回调
    cy.get('@onSave').should('have.been.calledWith', newContent);
  });

  it('shows loading state', () => {
    cy.mount(
      <FileEditor
        file={mockFile}
        content=""
        onSave={cy.stub()}
        isLoading={true}
      />
    );

    cy.get('.animate-spin').should('exist');
  });

  it('shows empty state when no file selected', () => {
    cy.mount(
      <FileEditor file={null} content="" onSave={cy.stub()} isLoading={false} />
    );

    cy.contains('Select a file to edit').should('exist');
    cy.get('textarea').should('not.exist');
  });
});
