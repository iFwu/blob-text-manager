describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')

    // Mock Vercel Blob API 请求
    cy.intercept({
      method: 'GET',
      url: /.*blob.*vercel.*storage.*com.*/,
    }, {
      statusCode: 200,
      body: []
    }).as('blobRequests')
  })

  it('should navigate to the home page', () => {
    cy.get('h1').should('contain', 'Blob Text Manager')
    cy.get('.flex.items-center').should('exist')
    cy.wait('@blobRequests', { timeout: 5000 }).then((interception) => {
      expect(interception.response?.statusCode).to.equal(200)
    })
  })
})
