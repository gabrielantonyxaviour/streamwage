/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    isMiniPay?: boolean;
    [key: string]: unknown;
  };
}

interface ImportMetaEnv {
  readonly VITE_VAULT_ADDRESS?: string;
  readonly VITE_CUSD_ADDRESS?: string;
  readonly VITE_SELF_VERIFIED_ADDRESS?: string;
  readonly VITE_SELF_ENDPOINT?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_CHAIN_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
