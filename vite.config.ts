import uniPackage from "@dcloudio/vite-plugin-uni";
import { fileURLToPath, URL } from "node:url";
import UnoCss from "unocss/vite";
import { defineConfig } from "vite";

// The current uni-app package exposes its plugin as a nested CommonJS default
// when Vite loads this ESM config.
const uni = (uniPackage as unknown as { default: typeof uniPackage }).default;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), UnoCss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
