import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
  },
  e2e: {
    experimentalMemoryManagement: true,
    defaultCommandTimeout: 10000,
    env: {
      NEXT_PUBLIC_IS_TEST: "true",
    },
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
      return config
    },
  },
});
