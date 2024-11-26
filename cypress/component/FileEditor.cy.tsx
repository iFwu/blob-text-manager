import FileEditor from '@/components/FileEditor';
import { BlobFile } from '@/types';
import { Toaster } from '@/components/ui/toaster';

describe('FileEditor', () => {
  const mockFile: BlobFile = {
    pathname: 'test.txt',
    url: 'https://example.com/test.txt',
    downloadUrl: 'https://example.com/test.txt',
    size: 100,
    uploadedAt: new Date().toISOString(),
    isDirectory: false,
  };

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <>
      {children}
      <Toaster />
    </>
  );

  it('renders empty state', () => {
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={null}
          content=""
          onSave={cy.stub()}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.contains('Select a file to edit').should('exist');
  });

  it('renders file content', () => {
    const content = 'Hello, World!';
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content={content}
          onSave={cy.stub().as('onSave')}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('textarea').should('have.value', content);
  });

  it('handles content changes', () => {
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content="Initial content"
          onSave={cy.stub().as('onSave')}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    const newContent = 'Updated content';
    cy.get('textarea').clear().type(newContent);
    cy.get('button').contains('Save').click();
    cy.get('@onSave').should('have.been.calledWith', newContent);
  });

  it('shows loading state', () => {
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content=""
          onSave={cy.stub()}
          isLoading={true}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('.animate-spin').should('exist');
  });

  it('handles close', () => {
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content=""
          onSave={cy.stub()}
          isLoading={false}
          onClose={cy.stub().as('onClose')}
        />
      </TestWrapper>
    );

    cy.get('button[aria-label="Close editor"]').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('handles save errors', () => {
    const errorMessage = 'Failed to save';
    const onSave = cy.stub().rejects(new Error(errorMessage));

    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content="Test content"
          onSave={onSave}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('button[aria-label="Save changes"]').click();
    cy.get('[role="alert"]').should('exist');
    cy.get('[role="alert"]').within(() => {
      cy.get('[role="heading"]').should('contain', 'Error');
      cy.get('[role="status"]').should('contain', 'Failed to save the file');
    });
  });

  it('updates content when props change', () => {
    const initialContent = 'Initial content';
    const updatedContent = 'Updated content';

    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content={initialContent}
          onSave={cy.stub()}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('textarea').should('have.value', initialContent);

    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content={updatedContent}
          onSave={cy.stub()}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('textarea').should('have.value', updatedContent);
  });

  it('disables save button while saving', () => {
    const savePromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
    const onSave = cy.stub().returns(savePromise);

    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content="Test content"
          onSave={onSave}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('button[aria-label="Save changes"]').as('saveButton').click();
    cy.get('button[aria-label="Saving..."]').should('exist');
    cy.get('.animate-spin').should('exist');
  });

  it('shows loading and success states', () => {
    // 创建一个延迟 resolve 的 Promise
    const savePromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
    const onSave = cy.stub().returns(savePromise);

    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content="Test content"
          onSave={onSave}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('button[aria-label="Save changes"]').click();
    cy.get('button[aria-label="Saving..."]').should('exist');
    cy.get('.animate-spin').should('exist');
    cy.get('button[aria-label="Saved!"]', { timeout: 3000 }).should('exist');
  });

  it('handles empty content', () => {
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content=""
          onSave={cy.stub().as('onSave')}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('textarea').should('have.value', '');
    cy.get('button').contains('Save').click();
    cy.get('@onSave').should('have.been.calledWith', '');
  });

  it('checks accessibility attributes', () => {
    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content="Test content"
          onSave={cy.stub()}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('[role="region"]').should('have.attr', 'aria-label', 'File editor');
    cy.get('button[aria-label="Close editor"]').should('exist');
    cy.get('textarea').should('have.attr', 'aria-label').and('not.be.empty');
  });

  it('shows loading state while saving', () => {
    // Create a Promise that won't resolve immediately
    const savePromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });
    const onSave = cy.stub().returns(savePromise);

    cy.mount(
      <TestWrapper>
        <FileEditor
          file={mockFile}
          content="Test content"
          onSave={onSave}
          isLoading={false}
          onClose={cy.stub()}
        />
      </TestWrapper>
    );

    cy.get('button[aria-label="Save changes"]').click();
    cy.get('button[aria-label="Saving..."]').should('exist');
    cy.get('.animate-spin').should('exist');
  });
});
