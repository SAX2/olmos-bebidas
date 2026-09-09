import { defineConfig, devices } from "@playwright/test";

// Real admin UI with external service fixtures; no OAuth bypass or test route in the app.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "admin-ui.spec.ts",
  workers: 1,
  use: { ...devices["Desktop Chrome"] },
});
