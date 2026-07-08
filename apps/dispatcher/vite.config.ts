import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tailwindcss(), vue()],
  resolve: {
    alias: {
      "@flovi/core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url)
      )
    }
  },
  test: {
    environment: "jsdom",
    coverage: {
      all: true,
      reporter: ["text", "json"],
      include: ["src/**/*.{ts,vue}"],
      exclude: ["src/main.ts", "src/env.d.ts"]
    }
  }
});
