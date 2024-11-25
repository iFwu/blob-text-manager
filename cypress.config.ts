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
    defaultCommandTimeout: 10000,
    env: {
      NEXT_PUBLIC_IS_TEST: "true",
    },
  },
});
