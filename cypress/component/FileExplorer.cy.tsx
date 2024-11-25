import FileExplorer from '@/components/FileExplorer'
import { BlobFile } from '@/types'

describe('FileExplorer', () => {
  const mockFiles: BlobFile[] = [
    {
      pathname: 'folder/',
      size: 0,
      uploadedAt: new Date().toISOString(),
      isDirectory: true
    },
    {
      pathname: 'folder/test.txt',
      url: 'https://example.com/test.txt',
      downloadUrl: 'https://example.com/test.txt',
      size: 100,
      uploadedAt: new Date().toISOString(),
      isDirectory: false
    }
  ]

  it('renders empty state', () => {
    cy.mount(
      <FileExplorer
        files={[]}
        onFileSelect={cy.stub().as('onFileSelect')}
        onFileDelete={cy.stub().as('onFileDelete')}
        onSetCreateTarget={cy.stub().as('onSetCreateTarget')}
        isLoading={false}
        selectedFile={null}
      />
    )
  })

  it('renders files and folders', () => {
    cy.mount(
      <FileExplorer
        files={mockFiles}
        onFileSelect={cy.stub().as('onFileSelect')}
        onFileDelete={cy.stub().as('onFileDelete')}
        onSetCreateTarget={cy.stub().as('onSetCreateTarget')}
        isLoading={false}
        selectedFile={null}
      />
    )

    // 检查文件夹是否渲染
    cy.contains('folder').should('exist')
    
    // 展开文件夹
    cy.contains('folder').click()
    
    // 检查文件是否渲染
    cy.contains('test.txt').should('exist')
  })

  it('handles file selection', () => {
    cy.mount(
      <FileExplorer
        files={mockFiles}
        onFileSelect={cy.stub().as('onFileSelect')}
        onFileDelete={cy.stub().as('onFileDelete')}
        onSetCreateTarget={cy.stub().as('onSetCreateTarget')}
        isLoading={false}
        selectedFile={null}
      />
    )

    // 展开文件夹
    cy.contains('folder').click()
    
    // 点击文件
    cy.contains('test.txt').click()
    
    // 验证选择回调
    cy.get('@onFileSelect').should('have.been.calledWith', mockFiles[1])
  })

  it('shows loading state', () => {
    cy.mount(
      <FileExplorer
        files={[]}
        onFileSelect={cy.stub()}
        onFileDelete={cy.stub()}
        onSetCreateTarget={cy.stub()}
        isLoading={true}
        selectedFile={null}
      />
    )

    cy.contains('Loading...').should('exist')
  })
}) 