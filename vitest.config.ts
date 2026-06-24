import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    // jsdom = lažni browser (DOM API) za RTL komponente; pure funkcije rade i bez njega.
    environment: "jsdom",
    globals: true, // describe/it/expect bez importa
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    // da `@/...` radi i u testovima (isti alias kao u tsconfig).
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
