import CreateForm from '@/components/CreateForm';
import { Toaster } from '@/components/ui/toaster';
import type { ValidateFileNameParams, ValidationResult } from '@/types';
import { createAsyncStub } from '../support/utils';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

describe('CreateForm', () => {
  // 添加一个模拟的验证函数
  const mockValidateFileName: (
    params: ValidateFileNameParams
  ) => ValidationResult = (params) => ({
    isValid: !params.pathname.includes('<'),
    error: params.pathname.includes('<')
      ? 'Name contains invalid characters'
      : null,
  });

  it('renders with target path', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={cy.stub().as('onCreateFile')}
          currentDirectory="test/"
          targetPath="test/"
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    cy.get('input').should('exist');
    cy.get('input').should('have.value', '');
  });

  it('handles file creation', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={cy.stub().as('onCreateFile')}
          currentDirectory="test/"
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    cy.get('input').type('newfile.txt{enter}');
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/newfile.txt');
  });

  it('handles folder creation', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={cy.stub().as('onCreateFile')}
          currentDirectory="test/"
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    cy.get('input').type('newfolder/{enter}');
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/newfolder/');
  });

  it('validates input and shows error messages', () => {
    const onCreateFile = cy.stub().as('onCreateFile');
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={onCreateFile}
          currentDirectory=""
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    // 空输入
    cy.get('input').type('{enter}');
    cy.get('@onCreateFile').should('not.have.been.called');
    cy.contains('Please enter a name').should('be.visible');
    cy.get('input').should('have.class', 'border-destructive');

    // 非法字符
    cy.get('input').clear().type('test<>.txt{enter}');
    cy.get('@onCreateFile').should('not.have.been.called');
    cy.contains('Name contains invalid characters').should('be.visible');
    cy.get('input').should('have.class', 'border-destructive');

    // 输入有效内容后错误消失
    cy.get('input').clear().type('valid.txt');
    cy.contains('Name contains invalid characters').should('not.exist');
    cy.get('input').should('not.have.class', 'border-destructive');
  });

  it('shows loading and success states during file creation', () => {
    const onCreateFile = createAsyncStub();

    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={onCreateFile}
          currentDirectory=""
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    // Initial state
    cy.get('button[aria-label="Create new file"]').should('be.enabled');

    // Trigger file creation
    cy.get('input').type('test.txt');
    cy.get('button[aria-label="Create new file"]').click();

    // Loading state
    cy.get('button[aria-label="Creating file..."]').should('be.disabled');
    cy.get('.animate-spin').should('exist');

    // Success state
    cy.get('button[aria-label="File created!"]', { timeout: 3000 }).should(
      'exist'
    );

    // Back to initial state
    cy.get('button[aria-label="Create new file"]').should('be.enabled');
  });

  it('displays directory prefix correctly', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={cy.stub()}
          currentDirectory="parent/"
          targetPath="parent/child/"
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    cy.get('.text-muted-foreground').should('contain', 'parent/child/');
  });

  it('handles creation failure', () => {
    // Create a failing stub
    const error = new Error('Test error message');
    const failingStub = createAsyncStub().rejects(error);

    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={failingStub}
          currentDirectory=""
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    cy.get('input').type('test.txt');
    cy.get('button').first().click();
    // Should show error toast
    cy.contains('Failed to create file. Error: Test error message').should(
      'be.visible'
    );
  });

  it('disables form during processing', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={createAsyncStub()}
          currentDirectory=""
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    cy.get('input').type('test.txt');
    cy.get('button').first().click();
    // Check that fieldset is disabled during processing
    cy.get('fieldset').should('have.attr', 'disabled');
    // After processing completes, fieldset should be enabled
    cy.get('fieldset').should('not.have.attr', 'disabled');
  });

  it('handles keyboard shortcuts correctly', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={cy.stub().as('onCreateFile')}
          currentDirectory="test/"
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    // Enter for file creation
    cy.get('input').type('test.txt{enter}');
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/test.txt');

    // Shift+Enter for folder creation
    cy.get('input').clear().type('testfolder{shift+enter}');
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/testfolder/');
  });

  it('normalizes paths correctly', () => {
    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={cy.stub().as('onCreateFile')}
          currentDirectory="test///"
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    // Multiple slashes in directory
    cy.get('input').type('file.txt{enter}');
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/file.txt');

    // Multiple slashes in input
    cy.get('input').clear().type('folder///subfolder///{enter}');
    cy.get('@onCreateFile').should(
      'have.been.calledWith',
      'test/folder/subfolder/'
    );
  });

  it('prevents concurrent operations', () => {
    const slowOperation = createAsyncStub(1000).as('onCreateFile');

    cy.mount(
      <TestWrapper>
        <CreateForm
          onCreateFile={slowOperation}
          currentDirectory=""
          targetPath=""
          validateFileName={mockValidateFileName}
        />
      </TestWrapper>
    );

    // Start file creation
    cy.get('input').type('test.txt');
    cy.get('button[aria-label="Create new file"]').click();

    // Both buttons should be disabled during operation
    cy.get('button[aria-label="Creating file..."]').should('be.disabled');
    cy.get('button[aria-label="Create new folder"]').should('be.disabled');

    // Trying to submit during operation should not trigger new operation
    cy.get('input').type('{enter}');
    cy.get('@onCreateFile').should('have.been.calledOnce');
  });
});
