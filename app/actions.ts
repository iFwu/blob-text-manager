/**
 * This is the entry point for blob management actions.
 * It will use different implementations based on the environment:
 * - In test: Uses client-side implementation
 * - In production: Uses server-side implementation
 */

const isTest = process.env.NODE_ENV === 'test';

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
