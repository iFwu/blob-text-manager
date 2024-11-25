describe('Navigation', () => {
  beforeEach(() => {
    // 打印环境变量
    cy.task('log', {
      message: 'Debug: Environment Variables',
      env: {
        NODE_ENV: Cypress.env('NODE_ENV'),
        NEXT_PUBLIC_IS_TEST: Cypress.env('NEXT_PUBLIC_IS_TEST'),
      }
    })

    // Mock Vercel Blob API 请求
    cy.intercept('GET', '**/blob.vercel-storage.com/**', (req) => {
      console.log('Debug: Intercepted Request', {
        url: req.url,
        method: req.method,
        headers: req.headers
      })
      req.reply({
        statusCode: 200,
        body: []
      })
    }).as('blobRequests')

    cy.task('log', {
      message: 'Debug: Intercept Setup Complete'
    })
  })

  it('should navigate to the home page', () => {
    cy.task('log', {
      message: 'Debug: Starting Navigation Test'
    })

    cy.visit('http://localhost:3000')
    cy.url().should('include', '/')
    
    cy.task('log', {
      message: 'Debug: Page Loaded'
    })
    
    // 等待页面内容加载
    cy.get('h1').should('contain', 'Blob Text Manager')
    cy.get('.flex.items-center').should('exist')
    
    cy.task('log', {
      message: 'Debug: UI Elements Verified'
    })
    
    // 等待所有 blob 请求完成
    cy.wait('@blobRequests', { timeout: 10000 })
    
    // 打印响应信息
    cy.get('@blobRequests').then((interception: any) => {
      console.log('Debug: Blob Request Complete', {
        response: interception.response
      })
      expect(interception.response?.statusCode).to.equal(200)
    })
  })
})
