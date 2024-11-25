import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  e2e: {
    experimentalMemoryManagement: true,
    defaultCommandTimeout: process.env.CI ? 10000 : 3000,
    env: {
      NEXT_PUBLIC_IS_TEST: "true",
    },
  },
});
