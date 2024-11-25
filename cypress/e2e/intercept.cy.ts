describe('Blob API Interceptor Tests', () => {
  beforeEach(() => {
    blobStorageMock.setupInterceptors();
    cy.visit('http://localhost:3000');
  });

  describe('API Interception', () => {
    it('[E2E-01] should intercept list blobs request on page load', () => {
      cy.get('h1').should('contain', 'Blob Text Manager');
      cy.get('.flex.items-center').should('exist');
      cy.wait('@listBlobs').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        expect(interception.response?.body).to.have.property('blobs');
      });
    });

    it('[E2E-02] should intercept file creation and retrieval', () => {
      const testFile = {
        pathname: 'test_file',
        content: 'test',
      };

      cy.window().then((win) => {
        return win.fetch('https://blob.vercel-storage.com/test_file', {
          method: 'PUT',
          body: testFile.content,
        });
      });

      cy.wait('@putFile').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        const { url } = interception.response?.body;

        cy.window().then((win) => {
          return win.fetch(url);
        });

        cy.wait('@getBlobContent').then((interception) => {
          expect(interception.response?.statusCode).to.equal(200);
          expect(interception.response?.body).to.equal(testFile.content);
        });

        cy.window().then((win) => {
          return win.fetch('https://blob.vercel-storage.com/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: [url] }),
          });
        });

        cy.wait('@deleteBlob').then((interception) => {
          expect(interception.response?.statusCode).to.equal(200);
        });
      });
    });

    it('[E2E-03] should intercept folder creation and deletion', () => {
      const folderName = 'test_folder';

      cy.window().then((win) => {
        return win.fetch(`https://blob.vercel-storage.com/${folderName}/`, {
          method: 'PUT',
          body: '',
        });
      });

      cy.wait('@putFolder').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
        const { url } = interception.response?.body;
        expect(url).to.equal(
          `https://mock.blob.vercel-storage.com/${folderName}/`
        );

        cy.window().then((win) => {
          return win.fetch('https://blob.vercel-storage.com/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: [url] }),
          });
        });

        cy.wait('@deleteBlob').then((interception) => {
          expect(interception.response?.statusCode).to.equal(200);
        });
      });
    });
  });
});
