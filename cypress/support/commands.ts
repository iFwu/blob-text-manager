/// <reference types="cypress" />
/// <reference types="@types/sinon" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
    }
  }
}

// Prevent TypeScript from reading file as legacy script
export {};
