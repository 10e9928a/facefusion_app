import uniPackage from "@dcloudio/vite-plugin-uni";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import UnoCss from "unocss/vite";
import { defineConfig, loadEnv } from "vite";
import { validateClientEnvironment, validatePlatformIdentity } from "./build/config.mjs";

// The current uni-app package exposes its plugin as a nested CommonJS default
// when Vite loads this ESM config.
const uni = (uniPackage as unknown as { default: typeof uniPackage }).default;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    validateClientEnvironment(loadEnv(mode, process.cwd(), ""), mode === "production");
    if (mode === "production") {
      const manifest = JSON.parse(readFileSync(new URL("./src/manifest.json", import.meta.url), "utf8"));
      validatePlatformIdentity(manifest, process.env.UNI_PLATFORM);
    }
  }

  return {
    plugins: [uni(), UnoCss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
