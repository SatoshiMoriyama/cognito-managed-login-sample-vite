/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REGION: string;
  readonly VITE_USER_POOL_ID: string;
  readonly VITE_USER_POOL_WEB_CLIENT_ID: string;
  readonly VITE_COGNITO_DOMAIN: string;
  readonly VITE_REDIRECT_SIGN_IN: string;
  readonly VITE_REDIRECT_SIGN_OUT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}