import CreateForm from '@/components/CreateForm'

describe('CreateForm', () => {
  // 添加一个模拟的验证函数
  const mockValidateFileName = (name: string) => ({
    isValid: !name.includes('<'),
    error: name.includes('<') ? 'Name contains invalid characters' : null
  });

  it('renders with target path', () => {
    cy.mount(
      <CreateForm
        onCreateFile={cy.stub().as('onCreateFile')}
        currentDirectory="test/"
        targetPath="test/"
        validateFileName={mockValidateFileName}
      />
    )

    cy.get('input').should('exist')
    cy.get('input').should('have.value', '')
  })

  it('handles file creation', () => {
    cy.mount(
      <CreateForm
        onCreateFile={cy.stub().as('onCreateFile')}
        currentDirectory="test/"
        targetPath=""
        validateFileName={mockValidateFileName}
      />
    )

    cy.get('input').type('newfile.txt{enter}')
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/newfile.txt')
  })

  it('handles folder creation', () => {
    cy.mount(
      <CreateForm
        onCreateFile={cy.stub().as('onCreateFile')}
        currentDirectory="test/"
        targetPath=""
        validateFileName={mockValidateFileName}
      />
    )

    cy.get('input').type('newfolder/{enter}')
    cy.get('@onCreateFile').should('have.been.calledWith', 'test/newfolder/')
  })

  it('validates input and shows error messages', () => {
    const onCreateFile = cy.stub().as('onCreateFile')
    cy.mount(
      <CreateForm
        onCreateFile={onCreateFile}
        currentDirectory=""
        targetPath=""
        validateFileName={mockValidateFileName}
      />
    )

    // 空输入
    cy.get('input').type('{enter}')
    cy.get('@onCreateFile').should('not.have.been.called')
    cy.contains('Please enter a name').should('be.visible')
    cy.get('input').should('have.class', 'border-destructive')

    // 非法字符
    cy.get('input').clear().type('test<>.txt{enter}')
    cy.get('@onCreateFile').should('not.have.been.called')
    cy.contains('Name contains invalid characters').should('be.visible')
    cy.get('input').should('have.class', 'border-destructive')

    // 输入有效内容后错误消失
    cy.get('input').clear().type('valid.txt')
    cy.contains('Name contains invalid characters').should('not.exist')
    cy.get('input').should('not.have.class', 'border-destructive')
  })
}) 