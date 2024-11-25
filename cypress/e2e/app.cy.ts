describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.window().then((win) => {
      const debugDiv = win.document.createElement('div')
      debugDiv.id = 'debug-output'
      debugDiv.style.cssText = 'position:fixed;top:0;right:0;width:800px;height:100vh;background:rgba(0,0,0,0.8);color:white;padding:20px;overflow:auto;z-index:9999;'
      win.document.body.appendChild(debugDiv)
      
      const originalLog = win.console.log
      win.console.log = (...args: any[]) => {
        originalLog.apply(console, args)
        const debugDiv = win.document.getElementById('debug-output')
        if (debugDiv) {
          const simplifyRequest = (req: any) => {
            if (req?.headers) {
              const { host, authorization } = req.headers
              req.headers = { host, authorization }
            }
            return req
          }
          
          const simplified = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              if ('headers' in arg) return simplifyRequest(arg)
              if (Array.isArray(arg)) return arg.map(simplifyRequest)
            }
            return arg
          })
          
          debugDiv.innerHTML = `<pre>${JSON.stringify(simplified, null, 1)}</pre><hr/>` + debugDiv.innerHTML
        }
      }
    })

    // 拦截所有请求
    cy.intercept('**', (req) => {
      cy.window().then((win) => {
        win.console.log('Request:', {
          url: req.url,
          method: req.method
        })
      })
    }).as('allRequests')

    // Mock Vercel Blob API 请求
    cy.intercept({
      method: 'GET',
      url: /.*blob.*vercel.*storage.*com.*/,
    }, {
      statusCode: 200,
      body: []
    }).as('blobRequests')

    // 环境变量
    cy.window().then((win) => {
      win.console.log('Environment:', {
        NODE_ENV: Cypress.env('NODE_ENV'),
        NEXT_PUBLIC_IS_TEST: Cypress.env('NEXT_PUBLIC_IS_TEST'),
        windowEnv: (win as any).process?.env
      })
    })
  })

  it('should navigate to the home page', () => {
    cy.get('h1').should('contain', 'Blob Text Manager')
    cy.get('.flex.items-center').should('exist')
    
    cy.get('@allRequests.all').then((interceptions) => {
      cy.window().then((win) => {
        win.console.log('Requests:', 
          interceptions.map((i: any) => ({
            url: i.request.url
          }))
        )
      })
    })

    cy.wait('@blobRequests', { timeout: 5000 }).then((interception) => {
      cy.window().then((win) => {
        win.console.log('Blob Response:', {
          status: interception.response?.statusCode
        })
      })
      expect(interception.response?.statusCode).to.equal(200)
    })
  })
})
