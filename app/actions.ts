/**
 * This is the entry point for blob management actions.
 * It will use different implementations based on the environment:
 * - In test: Uses client-side implementation
 * - In production: Uses server-side implementation
 */

const isTest = process.env.NEXT_PUBLIC_IS_TEST === 'true';

// Debug output
console.log('Debug: Actions Environment:', {
  NEXT_PUBLIC_IS_TEST: process.env.NEXT_PUBLIC_IS_TEST,
  isTest,
  NODE_ENV: process.env.NODE_ENV
});

// Dynamically import the appropriate implementation
const actions = isTest
  ? require('./actions.client')
  : require('./actions.server');

export const {
  listBlobs,
  getBlob,
  putBlob,
  deleteBlob
} = actions;
