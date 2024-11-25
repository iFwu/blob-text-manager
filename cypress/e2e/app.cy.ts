describe('Navigation', () => {
  beforeEach(() => {
    // Mock Vercel Blob API 请求
    cy.intercept('GET', '**/blob.vercel-storage.com/**', {
      statusCode: 200,
      body: []
    }).as('blobRequests')
  })

  it('should navigate to the home page', () => {
    cy.visit('http://localhost:3000')
    cy.url().should('include', '/')
    
    // 等待页面内容加载
    cy.get('h1').should('contain', 'Blob Text Manager')
    cy.get('.flex.items-center').should('exist')
    
    // 等待所有 blob 请求完成
    cy.wait('@blobRequests').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200)
    })
  })
})
