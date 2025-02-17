import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  mode: "test",
  test: {
    setupFiles: ["dotenv/config", "./vitest.setup.ts"],
    environment: "node",
    deps: {
      // Force Vitest to process ESM code in next-auth, next, oauth4webapi, etc.
      inline: ["next", "next-auth", "oauth4webapi"],
    },
    coverage: {
      include: ["lib/**/*.ts"],
      exclude: ["**/*.tsx", "app/**/page.tsx", "components/**", "lib/auth.ts"],
    },
  },
});
