/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUB_BASE?: string;
  readonly VITE_HUB_APP_KEY?: string;
  readonly VITE_HUB_CLIENT_SECRET?: string;
  readonly VITE_FF_API_BASE?: string;
  readonly VITE_FF_ENGINE_BASE?: string;
  readonly VITE_UPLOAD_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.vue" {
  import { DefineComponent } from "vue";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
