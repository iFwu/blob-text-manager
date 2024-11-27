import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    supportFile: 'cypress/support/component.tsx',
    specPattern: '**/*.cy.{ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
  e2e: {
    experimentalMemoryManagement: true,
    // biome-ignore lint/complexity/useLiteralKeys: typescript need use string keys to get index signature
    defaultCommandTimeout: process.env['CI'] ? 10000 : 3000,
    env: {
      NEXT_PUBLIC_IS_TEST: 'true',
    },
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
  },
});
