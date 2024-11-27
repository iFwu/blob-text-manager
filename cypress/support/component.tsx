import '@cypress/code-coverage/support';
import 'cypress-real-events';
import './commands';

// Cypress component testing specific configuration
import { mount } from 'cypress/react18';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
