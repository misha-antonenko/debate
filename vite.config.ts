import { defineConfig } from "vitest/config"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    exclude: ["node_modules/**"],
  },
})
